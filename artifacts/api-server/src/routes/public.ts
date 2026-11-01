import { Router, type IRouter } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import {
  db,
  servicesTable,
  servicePlansTable,
  portfolioItemsTable,
  testimonialsTable,
  faqsTable,
  slotsTable,
  clientInquiriesTable,
  meetingBookingsTable,
  siteSettingsTable,
  applicantsTable,
  serviceCategoryEnum,
  payoutMethodEnum,
} from "@workspace/db";
import {
  sendEmail,
  clientInquiryConfirmationEmail,
  inquiryAdminNotificationEmail,
  consultationConfirmationEmail,
  consultationAdminNotificationEmail,
  freelancerApplicationConfirmationEmail,
  applicantAdminNotificationEmail,
  verifyEmailConfig,
} from "../lib/email";
import {
  ListPublicServicesResponse,
  ListPublicServicePlansResponse,
  ListPublicPortfolioItemsQueryParams,
  ListPublicPortfolioItemsResponse,
  ListPublicTestimonialsResponse,
  ListPublicMeetingSlotsResponse,
  CreateInquiryBody,
  CreateInquiryResponse,
  CreateMeetingBookingBody,
  CreateMeetingBookingResponse,
  CreateAiChatBody,
  CreateAiChatResponse,
} from "@workspace/api-zod";
import { requireCsrf } from "../lib/auth";
import { ensureCsrfToken } from "../lib/session";

const router: IRouter = Router();
const isProd = process.env["NODE_ENV"] === "production";
const adminEmail = () => process.env.ADMIN_EMAIL || process.env.SMTP_USER;

// CSRF token for public forms (inquiries, AI chat, meeting bookings)
router.get("/public/csrf-token", async (req, res) => {
  const token = ensureCsrfToken(req as any);
  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.json({ csrfToken: token });
});

// Honeypot field name — real users won't fill it, bots might.
const HONEYPOT_FIELD = "website";

// Rate limit for inquiry submissions: 5 per 15 minutes per IP
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many inquiry submissions — please try again later." },
});

// Rate limit for AI chat: 20 per 15 minutes per IP
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI assistant requests — please try again later." },
});

router.get("/public/services", async (_req, res) => {
  const serviceRows = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.isActive, true))
    .orderBy(servicesTable.sortOrder);
  const planRows = serviceRows.length > 0
    ? await db
        .select()
        .from(servicePlansTable)
        .where(and(
          inArray(servicePlansTable.serviceId, serviceRows.map(s => s.id)),
          eq(servicePlansTable.isActive, true),
        ))
        .orderBy(servicePlansTable.sortOrder)
    : [];
  const rows = serviceRows.map(s => ({ ...s, plans: planRows.filter(p => p.serviceId === s.id) }));
  res.json(ListPublicServicesResponse.parse(rows));
});

router.get("/public/services/:slug/plans", async (req, res) => {
  const [service] = await db
    .select()
    .from(servicesTable)
    .where(and(eq(servicesTable.slug, req.params.slug), eq(servicesTable.isActive, true)));
  if (!service) { res.status(404).json({ message: "Service not found" }); return; }
  const plans = await db
    .select()
    .from(servicePlansTable)
    .where(and(eq(servicePlansTable.serviceId, service.id), eq(servicePlansTable.isActive, true)))
    .orderBy(servicePlansTable.sortOrder);
  res.json(ListPublicServicePlansResponse.parse(plans));
});

router.get(["/public/portfolio-items", "/public/portfolio"], async (req, res) => {
  const query = ListPublicPortfolioItemsQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(portfolioItemsTable)
    .where(
      and(
        eq(portfolioItemsTable.isPublished, true),
        query.category ? eq(portfolioItemsTable.serviceCategory, query.category) : undefined,
      ),
    )
    .orderBy(portfolioItemsTable.sortOrder);
  res.json(ListPublicPortfolioItemsResponse.parse(rows));
});

router.get("/public/testimonials", async (_req, res) => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.isPublished, true))
    .orderBy(testimonialsTable.sortOrder, testimonialsTable.id);
  res.json(ListPublicTestimonialsResponse.parse(rows));
});

router.get("/public/meeting-slots", async (_req, res) => {
  const rows = await db
    .select()
    .from(slotsTable)
    .where(eq(slotsTable.purpose, "CLIENT_MEETING"))
    .orderBy(slotsTable.date, slotsTable.startTime);
  res.json(ListPublicMeetingSlotsResponse.parse(rows.filter((r) => r.booked < r.capacity)));
});

router.get("/public/site-settings", async (_req, res) => {
  const rows = await db.select().from(siteSettingsTable);
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  res.json(settings);
});

router.get("/public/faqs", async (_req, res) => {
  const rows = await db
    .select()
    .from(faqsTable)
    .where(eq(faqsTable.isPublished, true))
    .orderBy(faqsTable.sortOrder, faqsTable.id);
  res.json(rows);
});

/**
 * Submit a client inquiry.
 * Persists first, then sends emails non-blocking.
 * Never claims an email was sent if SMTP fails.
 */
router.post("/public/inquiries", inquiryLimiter, async (req, res) => {
  const body = CreateInquiryBody.parse(req.body);

  // Honeypot spam check
  if ((req.body as any)[HONEYPOT_FIELD]) {
    res.status(201).json({ message: "Received" });
    return;
  }

  let emailStatus: "not_sent" | "sent" | "failed" = "not_sent";
  let emailError: string | null = null;

  const [inquiry] = await db
    .insert(clientInquiriesTable)
    .values({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      business: body.business ?? null,
      serviceNeeded: body.serviceNeeded ?? null,
      projectDetails: body.projectDetails,
      budgetRange: body.budgetRange ?? null,
      currency: body.currency ?? null,
      timeline: body.timeline ?? null,
      preferredContactMethod: body.preferredContactMethod ?? null,
      servicePlanId: body.servicePlanId ?? null,
    })
    .returning();

  // Send emails non-blocking. Persist first so we never lose the inquiry.
  const adminEmailValue = adminEmail();
  if (adminEmailValue) {
    const clientResult = await sendEmail(
      inquiry.email,
      "We've Received Your Request — Trivenix Partners",
      clientInquiryConfirmationEmail(inquiry.name, inquiry.serviceNeeded),
    );
    const adminResult = await sendEmail(
      adminEmailValue,
      `New Quote Request from ${inquiry.name}`,
      inquiryAdminNotificationEmail({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        serviceNeeded: inquiry.serviceNeeded,
        projectDetails: inquiry.projectDetails,
        budgetRange: inquiry.budgetRange,
        timeline: inquiry.timeline,
      }),
    );

    if (clientResult.success && adminResult.success) {
      emailStatus = "sent";
    } else {
      emailStatus = "failed";
      emailError = (clientResult.error || adminResult.error) || null;
    }
  } else {
    emailError = "SMTP not configured";
  }

  await db
    .update(clientInquiriesTable)
    .set({ emailStatus, emailSentAt: emailStatus === "sent" ? new Date() : null })
    .where(eq(clientInquiriesTable.id, inquiry.id));

  res.status(201).json(
    CreateInquiryResponse.parse({
      ...inquiry,
      emailStatus,
    }),
  );
});

/**
 * Submit a freelancer application.
 * Persists the applicant, sends a confirmation email to the applicant
 * and an admin notification. Rate-limited.
 */
router.post("/public/applicants", inquiryLimiter, async (req, res) => {
  const body = z.object({
    fullName: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(5, "Phone number is required"),
    serviceCategory: z.enum(serviceCategoryEnum.enumValues as [string, ...string[]]),
    portfolioLinks: z.array(z.string().url("Each link must be a valid URL")).min(1, "At least one portfolio link is required"),
    yearsExperience: z.coerce.number().min(0).max(50),
    equipmentOwned: z.string().optional(),
    availability: z.string().min(2, "Please indicate your availability"),
    expectedRate: z.string().min(2, "Please indicate your expected rate"),
    preferredPayout: z.enum(payoutMethodEnum.enumValues as [string, ...string[]]),
    coverNote: z.string().optional(),
    resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }).parse(req.body);

  // Honeypot spam check
  if ((req.body as any)[HONEYPOT_FIELD]) {
    res.status(201).json({ message: "Received" });
    return;
  }

  const [applicant] = await db
    .insert(applicantsTable)
    .values({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      serviceCategory: body.serviceCategory,
      portfolioLinks: body.portfolioLinks,
      yearsExperience: body.yearsExperience,
      equipmentOwned: body.equipmentOwned ?? null,
      availability: body.availability,
      expectedRate: body.expectedRate,
      preferredPayout: body.preferredPayout,
      coverNote: body.coverNote ?? null,
      resumeUrl: body.resumeUrl || null,
    } as any)
    .returning();

  // Send confirmation email to applicant + admin notification (non-blocking)
  const adminEmailValue = adminEmail();
  if (adminEmailValue) {
    const clientResult = await sendEmail(
      applicant.email,
      "Your application has been received — Trivenix Partners",
      freelancerApplicationConfirmationEmail(applicant.fullName, applicant.serviceCategory),
    );
    const adminResult = await sendEmail(
      adminEmailValue,
      `New Freelancer Application from ${applicant.fullName}`,
      applicantAdminNotificationEmail({
        id: applicant.id,
        fullName: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        serviceCategory: applicant.serviceCategory,
        yearsExperience: applicant.yearsExperience,
        availability: applicant.availability,
        expectedRate: applicant.expectedRate,
        coverNote: applicant.coverNote,
        resumeUrl: applicant.resumeUrl,
      }),
    );
    if (!clientResult.success || !adminResult.success) {
      console.warn("[applicant] Email delivery partially failed:", {
        client: clientResult.error,
        admin: adminResult.error,
      });
    }
  }

  res.status(201).json({
    id: applicant.id,
    message: "Application submitted successfully",
  });
});

router.post("/public/meeting-bookings", async (req, res) => {
  const body = CreateMeetingBookingBody.parse(req.body);
  const [slot] = await db.select().from(slotsTable).where(eq(slotsTable.id, body.slotId));
  if (!slot || slot.purpose !== "CLIENT_MEETING" || slot.booked >= slot.capacity) {
    res.status(400).json({ message: "This slot is no longer available" });
    return;
  }

  const [booking] = await db
    .insert(meetingBookingsTable)
    .values({
      slotId: body.slotId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      notes: body.notes ?? null,
    })
    .returning();
  await db
    .update(slotsTable)
    .set({ booked: slot.booked + 1 })
    .where(eq(slotsTable.id, slot.id));

  const slotWithBooking = { ...slot, booked: slot.booked + 1 };
  await sendEmail(
    booking.clientEmail,
    "Your Consultation Is Booked — Trivenix Partners",
    consultationConfirmationEmail(booking.clientName, slotWithBooking),
  );
  if (adminEmail()) {
    await sendEmail(
      adminEmail()!,
      `New Consultation Booking from ${booking.clientName}`,
      consultationAdminNotificationEmail({ ...booking, slot: slotWithBooking }),
    );
  }

  res.status(201).json(CreateMeetingBookingResponse.parse({ ...booking, slot: slotWithBooking }));
});

/**
 * AI assistant endpoint. Grounded in approved public knowledge.
 * Implemented here as a thin handler; the actual Gemini call is in lib/ai.ts.
 */
router.post("/public/ai-chat", aiChatLimiter, async (req, res) => {
  const body = CreateAiChatBody.parse(req.body);
  try {
    const { generateAiReply } = await import("../lib/ai");
    const reply = await generateAiReply(body.message, body.pageContext ?? undefined);
    res.json(CreateAiChatResponse.parse({ reply }));
  } catch (err) {
    console.error("[ai] Assistant error:", err instanceof Error ? err.message : String(err));
    res.status(500).json({ message: "Assistant temporarily unavailable" });
  }
});

export default router;
