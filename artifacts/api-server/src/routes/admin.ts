import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  clientInquiriesTable,
  meetingBookingsTable,
  slotsTable,
  projectsTable,
  servicesTable,
  servicePlansTable,
  portfolioItemsTable,
  testimonialsTable,
  faqsTable,
  auditLogsTable,
  siteSettingsTable,
  mediaAssetsTable,
  usersTable,
  applicantsTable,
} from "@workspace/db";
import {
  GetAdminDashboardResponse,
  ListAdminInquiriesResponse,
  UpdateAdminInquiryParams,
  UpdateAdminInquiryBody,
  UpdateAdminInquiryResponse,
  ListAdminMeetingSlotsResponse,
  CreateAdminMeetingSlotBody,
  CreateAdminMeetingSlotResponse,
  UpdateAdminMeetingSlotParams,
  UpdateAdminMeetingSlotBody,
  UpdateAdminMeetingSlotResponse,
  ListAdminMeetingBookingsResponse,
  UpdateAdminMeetingBookingParams,
  UpdateAdminMeetingBookingBody,
  UpdateAdminMeetingBookingResponse,
  ListAdminServicesResponse,
  CreateAdminServiceBody,
  CreateAdminServiceResponse,
  UpdateAdminServiceParams,
  UpdateAdminServiceBody,
  UpdateAdminServiceResponse,
  DeleteAdminServiceParams,
  ListAdminServicePlansResponse,
  CreateAdminServicePlanBody,
  CreateAdminServicePlanResponse,
  UpdateAdminServicePlanParams,
  UpdateAdminServicePlanBody,
  UpdateAdminServicePlanResponse,
  DeleteAdminServicePlanParams,
  ListAdminPortfolioItemsResponse,
  CreateAdminPortfolioItemBody,
  CreateAdminPortfolioItemResponse,
  UpdateAdminPortfolioItemParams,
  UpdateAdminPortfolioItemBody,
  UpdateAdminPortfolioItemResponse,
  DeleteAdminPortfolioItemParams,
  ListAdminTestimonialsResponse,
  CreateAdminTestimonialBody,
  CreateAdminTestimonialResponse,
  UpdateAdminTestimonialParams,
  UpdateAdminTestimonialBody,
  UpdateAdminTestimonialResponse,
  DeleteAdminTestimonialParams,
  ListAdminAuditLogsQueryParams,
  ListAdminAuditLogsResponse,
  ListAdminProjectsResponse,
  CreateAdminProjectBody,
  CreateAdminProjectResponse,
  UpdateAdminProjectParams,
  UpdateAdminProjectBody,
  UpdateAdminProjectResponse,
  DeleteAdminProjectParams,
  CreateMediaUploadBody,
  CreateMediaUploadResponse,
} from "@workspace/api-zod";
import { requireRole, requireCsrf } from "../lib/auth";
import { recordAuditLog } from "../lib/auditLog";
import { verifyEmailConfig, sendEmail } from "../lib/email";
import { ensureCsrfToken } from "../lib/session";

const router: IRouter = Router();

router.use("/admin", requireRole("ADMIN"));

// CSRF protection for all admin state-changing routes
router.use("/admin", (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }
  requireCsrf(req, res, next);
});

// ---------- Dashboard ----------

router.get("/admin/dashboard", async (_req, res) => {
  const [
    [newInquiries],
    [upcomingConsultations],
    [activeProjects],
    [totalServices],
    [totalTestimonials],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(clientInquiriesTable)
      .where(eq(clientInquiriesTable.status, "new")),
    db.select({ count: sql<number>`count(*)::int` })
      .from(meetingBookingsTable)
      .where(eq(meetingBookingsTable.status, "confirmed")),
    db.select({ count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(eq(projectsTable.status, "in_progress")),
    db.select({ count: sql<number>`count(*)::int` })
      .from(servicesTable)
      .where(eq(servicesTable.isActive, true)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(testimonialsTable)
      .where(eq(testimonialsTable.isPublished, true)),
  ]);

  res.json(
    GetAdminDashboardResponse.parse({
      newApplicants: 0,
      interviewsThisWeek: 0,
      activeProjects: activeProjects?.count ?? 0,
      newInquiries: newInquiries?.count ?? 0,
      upcomingConsultations: upcomingConsultations?.count ?? 0,
      applicantsByStatus: {},
      projectsByStatus: {},
    }),
  );
});

// ---------- Freelancer applicants ----------

const AdminApplicantUpdateBody = z.object({
  status: z.enum(["applied", "interview_scheduled", "interviewed", "selected", "rejected"]).optional(),
  adminNotes: z.string().optional(),
});

router.get("/admin/applicants", async (_req, res) => {
  const rows = await db
    .select()
    .from(applicantsTable)
    .orderBy(desc(applicantsTable.createdAt));
  res.json(rows);
});

router.get("/admin/applicants/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid applicant id" });
    return;
  }
  const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, id));
  if (!applicant) {
    res.status(404).json({ message: "Applicant not found" });
    return;
  }
  res.json(applicant);
});

router.patch("/admin/applicants/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid applicant id" });
    return;
  }
  const body = AdminApplicantUpdateBody.parse(req.body);
  const [updated] = await db
    .update(applicantsTable)
    .set(body)
    .where(eq(applicantsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Applicant not found" });
    return;
  }
  await recordAuditLog(String(req.session.userId), "applicant.update", { applicantId: id, ...body });
  res.json(updated);
});

router.post("/admin/applicants/:id/reject", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid applicant id" });
    return;
  }
  const [updated] = await db
    .update(applicantsTable)
    .set({ status: "rejected" })
    .where(eq(applicantsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Applicant not found" });
    return;
  }
  await recordAuditLog(String(req.session.userId), "applicant.reject", { applicantId: id });
  res.json(updated);
});

router.delete("/admin/applicants/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid applicant id" });
    return;
  }
  const [deleted] = await db.delete(applicantsTable).where(eq(applicantsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ message: "Applicant not found" }); return; }
  await recordAuditLog(String(req.session.userId), "applicant.delete", { applicantId: id });
  res.status(204).send();
});

// ---------- Client inquiries ----------

router.get("/admin/inquiries", async (_req, res) => {
  const rows = await db.select().from(clientInquiriesTable).orderBy(desc(clientInquiriesTable.createdAt));
  res.json(ListAdminInquiriesResponse.parse(rows));
});

router.patch("/admin/inquiries/:id", async (req, res) => {
  const params = UpdateAdminInquiryParams.parse(req.params);
  const body = UpdateAdminInquiryBody.parse(req.body);
  const [updated] = await db
    .update(clientInquiriesTable)
    .set(body)
    .where(eq(clientInquiriesTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Inquiry not found" });
    return;
  }
  await recordAuditLog(String(req.session.userId), "inquiry.update", { inquiryId: params.id, ...body });
  res.json(UpdateAdminInquiryResponse.parse(updated));
});

router.delete("/admin/inquiries/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(clientInquiriesTable).where(eq(clientInquiriesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ message: "Inquiry not found" }); return; }
  await recordAuditLog(String(req.session.userId), "inquiry.delete", { inquiryId: id });
  res.status(204).send();
});

// ---------- Consultation slots ----------

router.get("/admin/meeting-slots", async (_req, res) => {
  const rows = await db
    .select()
    .from(slotsTable)
    .where(eq(slotsTable.purpose, "CLIENT_MEETING"))
    .orderBy(slotsTable.date, slotsTable.startTime);
  res.json(ListAdminMeetingSlotsResponse.parse(rows));
});

router.post("/admin/meeting-slots", async (req, res) => {
  const body = CreateAdminMeetingSlotBody.parse(req.body);
  const [slot] = await db
    .insert(slotsTable)
    .values({ ...body, date: body.date.toISOString().slice(0, 10) })
    .returning();
  res.status(201).json(CreateAdminMeetingSlotResponse.parse(slot));
});

router.patch("/admin/meeting-slots/:id", async (req, res) => {
  const params = UpdateAdminMeetingSlotParams.parse(req.params);
  const body = UpdateAdminMeetingSlotBody.parse(req.body);
  const [updated] = await db
    .update(slotsTable)
    .set({ ...body, date: body.date ? body.date.toISOString().slice(0, 10) : undefined })
    .where(eq(slotsTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Slot not found" });
    return;
  }
  res.json(UpdateAdminMeetingSlotResponse.parse(updated));
});

router.delete("/admin/meeting-slots/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid slot id" }); return; }
  const [booked] = await db.select().from(meetingBookingsTable).where(eq(meetingBookingsTable.slotId, id));
  if (booked) { res.status(409).json({ message: "Cannot delete a slot that has an active booking" }); return; }
  await db.delete(slotsTable).where(eq(slotsTable.id, id));
  res.status(204).end();
});

// ---------- Consultation bookings ----------

router.get("/admin/meeting-bookings", async (_req, res) => {
  const rows = await db
    .select({ booking: meetingBookingsTable, slot: slotsTable })
    .from(meetingBookingsTable)
    .innerJoin(slotsTable, eq(meetingBookingsTable.slotId, slotsTable.id))
    .orderBy(desc(meetingBookingsTable.createdAt));
  res.json(ListAdminMeetingBookingsResponse.parse(rows.map((r) => ({ ...r.booking, slot: r.slot }))));
});

router.patch("/admin/meeting-bookings/:id", async (req, res) => {
  const params = UpdateAdminMeetingBookingParams.parse(req.params);
  const body = UpdateAdminMeetingBookingBody.parse(req.body);
  const [updated] = await db
    .update(meetingBookingsTable)
    .set(body)
    .where(eq(meetingBookingsTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  const [slot] = await db.select().from(slotsTable).where(eq(slotsTable.id, updated.slotId));
  res.json(UpdateAdminMeetingBookingResponse.parse({ ...updated, slot }));
});

// ---------- Projects (internal only) ----------

router.get("/admin/projects", async (_req, res) => {
  const rows = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
  res.json(ListAdminProjectsResponse.parse(rows));
});

router.post("/admin/projects", async (req, res) => {
  const body = CreateAdminProjectBody.parse(req.body);
  const [project] = await db.insert(projectsTable).values(body).returning();
  await recordAuditLog(String(req.session.userId), "project.create", { projectId: project.id });
  res.status(201).json(CreateAdminProjectResponse.parse(project));
});

router.patch("/admin/projects/:id", async (req, res) => {
  const params = UpdateAdminProjectParams.parse(req.params);
  const body = UpdateAdminProjectBody.parse(req.body);
  const [updated] = await db
    .update(projectsTable)
    .set(body)
    .where(eq(projectsTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Project not found" });
    return;
  }
  res.json(UpdateAdminProjectResponse.parse(updated));
});

router.delete("/admin/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ message: "Project not found" }); return; }
  await recordAuditLog(String(req.session.userId), "project.delete", { projectId: id });
  res.status(204).send();
});

// ---------- Services ----------

router.get("/admin/services", async (_req, res) => {
  const serviceRows = await db.select().from(servicesTable).orderBy(servicesTable.sortOrder);
  const planRows = serviceRows.length > 0
    ? await db.select().from(servicePlansTable)
        .where(inArray(servicePlansTable.serviceId, serviceRows.map(s => s.id)))
        .orderBy(servicePlansTable.sortOrder)
    : [];
  const rows = serviceRows.map(s => ({ ...s, plans: planRows.filter(p => p.serviceId === s.id) }));
  res.json(ListAdminServicesResponse.parse(rows));
});

router.post("/admin/services", async (req, res) => {
  const body = CreateAdminServiceBody.parse(req.body);
  const [service] = await db.insert(servicesTable).values(body).returning();
  await recordAuditLog(String(req.session.userId), "service.create", { serviceId: service.id });
  res.status(201).json(CreateAdminServiceResponse.parse(service));
});

router.patch("/admin/services/:id", async (req, res) => {
  const params = UpdateAdminServiceParams.parse(req.params);
  const body = UpdateAdminServiceBody.parse(req.body);
  const [updated] = await db
    .update(servicesTable)
    .set(body)
    .where(eq(servicesTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  await recordAuditLog(String(req.session.userId), "service.update", { serviceId: params.id, ...body });
  res.json(UpdateAdminServiceResponse.parse(updated));
});

router.delete("/admin/services/:id", async (req, res) => {
  const params = DeleteAdminServiceParams.parse(req.params);
  await db.delete(servicesTable).where(eq(servicesTable.id, params.id));
  await recordAuditLog(String(req.session.userId), "service.delete", { serviceId: params.id });
  res.status(204).end();
});

// ---------- Service Plans ----------

router.get("/admin/service-plans", async (req, res) => {
  const serviceId = Number(req.query.serviceId);
  if (!serviceId || isNaN(serviceId)) {
    res.status(400).json({ message: "serviceId query param required" });
    return;
  }
  const rows = await db
    .select()
    .from(servicePlansTable)
    .where(eq(servicePlansTable.serviceId, serviceId))
    .orderBy(servicePlansTable.sortOrder, servicePlansTable.id);
  res.json(ListAdminServicePlansResponse.parse(rows));
});

router.post("/admin/service-plans", async (req, res) => {
  const body = CreateAdminServicePlanBody.parse(req.body);
  const [plan] = await db.insert(servicePlansTable).values(body).returning();
  res.status(201).json(CreateAdminServicePlanResponse.parse(plan));
});

router.patch("/admin/service-plans/:id", async (req, res) => {
  const params = UpdateAdminServicePlanParams.parse(req.params);
  const body = UpdateAdminServicePlanBody.parse(req.body);
  const [updated] = await db
    .update(servicePlansTable)
    .set(body)
    .where(eq(servicePlansTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Service plan not found" });
    return;
  }
  res.json(UpdateAdminServicePlanResponse.parse(updated));
});

router.delete("/admin/service-plans/:id", async (req, res) => {
  const params = DeleteAdminServicePlanParams.parse(req.params);
  await db.delete(servicePlansTable).where(eq(servicePlansTable.id, params.id));
  res.status(204).end();
});

// ---------- Portfolio items ----------

router.get("/admin/portfolio-items", async (_req, res) => {
  const rows = await db.select().from(portfolioItemsTable).orderBy(portfolioItemsTable.sortOrder);
  res.json(ListAdminPortfolioItemsResponse.parse(rows));
});

router.post("/admin/portfolio-items", async (req, res) => {
  const body = CreateAdminPortfolioItemBody.parse(req.body);
  const [item] = await db.insert(portfolioItemsTable).values(body).returning();
  await recordAuditLog(String(req.session.userId), "portfolio.create", { portfolioId: item.id });
  res.status(201).json(CreateAdminPortfolioItemResponse.parse(item));
});

router.patch("/admin/portfolio-items/:id", async (req, res) => {
  const params = UpdateAdminPortfolioItemParams.parse(req.params);
  const body = UpdateAdminPortfolioItemBody.parse(req.body);
  const [updated] = await db
    .update(portfolioItemsTable)
    .set(body)
    .where(eq(portfolioItemsTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Portfolio item not found" });
    return;
  }
  await recordAuditLog(String(req.session.userId), "portfolio.update", { portfolioId: params.id, ...body });
  res.json(UpdateAdminPortfolioItemResponse.parse(updated));
});

router.delete("/admin/portfolio-items/:id", async (req, res) => {
  const params = DeleteAdminPortfolioItemParams.parse(req.params);
  await db.delete(portfolioItemsTable).where(eq(portfolioItemsTable.id, params.id));
  await recordAuditLog(String(req.session.userId), "portfolio.delete", { portfolioId: params.id });
  res.status(204).end();
});

// ---------- Testimonials ----------

router.get("/admin/testimonials", async (_req, res) => {
  const rows = await db.select().from(testimonialsTable).orderBy(testimonialsTable.sortOrder, testimonialsTable.id);
  res.json(ListAdminTestimonialsResponse.parse(rows));
});

router.post("/admin/testimonials", async (req, res) => {
  const body = CreateAdminTestimonialBody.parse(req.body);
  const [item] = await db.insert(testimonialsTable).values({
    ...body,
    videoSource: body.videoSource ?? null,
    serviceCategory: body.serviceCategory ?? null,
  } as any).returning();
  await recordAuditLog(String(req.session.userId), "testimonial.create", { testimonialId: item.id });
  res.status(201).json(CreateAdminTestimonialResponse.parse(item));
});

router.patch("/admin/testimonials/:id", async (req, res) => {
  const params = UpdateAdminTestimonialParams.parse(req.params);
  const body = UpdateAdminTestimonialBody.parse(req.body);
  const [updated] = await db
    .update(testimonialsTable)
    .set({
      ...body,
      videoSource: body.videoSource ?? null,
      serviceCategory: body.serviceCategory ?? null,
    } as any)
    .where(eq(testimonialsTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Testimonial not found" });
    return;
  }
  await recordAuditLog(String(req.session.userId), "testimonial.update", { testimonialId: params.id, ...body });
  res.json(UpdateAdminTestimonialResponse.parse(updated));
});

router.delete("/admin/testimonials/:id", async (req, res) => {
  const params = DeleteAdminTestimonialParams.parse(req.params);
  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, params.id));
  await recordAuditLog(String(req.session.userId), "testimonial.delete", { testimonialId: params.id });
  res.status(204).end();
});

// ---------- FAQs ----------

router.get("/admin/faqs", async (_req, res) => {
  const rows = await db.select().from(faqsTable).orderBy(faqsTable.sortOrder, faqsTable.id);
  res.json(rows);
});

router.post("/admin/faqs", async (req, res) => {
  const { z } = await import("zod");
  const body = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    sortOrder: z.coerce.number().int().optional(),
    isPublished: z.coerce.boolean().optional(),
  }).parse(req.body);
  const [row] = await db.insert(faqsTable).values({
    question: body.question.trim(),
    answer: body.answer.trim(),
    sortOrder: body.sortOrder ?? 0,
    isPublished: body.isPublished ?? true,
  }).returning();
  res.status(201).json(row);
});

router.patch("/admin/faqs/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { z } = await import("zod");
  const body = z.object({
    question: z.string().min(1).optional(),
    answer: z.string().min(1).optional(),
    sortOrder: z.coerce.number().int().optional(),
    isPublished: z.coerce.boolean().optional(),
  }).parse(req.body);
  const updates: Record<string, unknown> = {};
  if (body.question !== undefined) updates.question = body.question.trim();
  if (body.answer !== undefined) updates.answer = body.answer.trim();
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
  if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
  const [row] = await db.update(faqsTable).set(updates).where(eq(faqsTable.id, id)).returning();
  if (!row) { res.status(404).json({ message: "Not found" }); return; }
  res.json(row);
});

router.delete("/admin/faqs/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(faqsTable).where(eq(faqsTable.id, id));
  res.status(204).end();
});

// ---------- Site Settings ----------

router.get("/admin/site-settings", async (_req, res) => {
  const rows = await db.select().from(siteSettingsTable).orderBy(siteSettingsTable.key);
  res.json(rows);
});

router.patch("/admin/site-settings/:key", async (req, res) => {
  const key = req.params.key;
  const { value } = req.body;
  if (typeof value !== "string") {
    res.status(400).json({ message: "value must be a string" });
    return;
  }
  const [updated] = await db
    .update(siteSettingsTable)
    .set({ value, updatedAt: new Date() })
    .where(eq(siteSettingsTable.key, key))
    .returning();
  if (!updated) {
    const [inserted] = await db
      .insert(siteSettingsTable)
      .values({ key, value, label: key })
      .returning();
    res.json(inserted);
    return;
  }
  await recordAuditLog(String(req.session.userId), "site_settings.update", { key, value });
  res.json(updated);
});

// ---------- Media upload (signed URL) ----------

router.post("/admin/media/upload", async (req, res) => {
  const body = CreateMediaUploadBody.parse(req.body);
  try {
    const { createSignedUpload } = await import("../lib/media");
    const result = await createSignedUpload(body);
    res.status(200).json(CreateMediaUploadResponse.parse(result));
  } catch (err) {
    console.error("[media] Upload error:", err instanceof Error ? err.message : String(err));
    res.status(400).json({ message: err instanceof Error ? err.message : "Media upload not configured" });
  }
});

// ---------- Email configuration test ----------

router.get("/admin/email/test", async (_req, res) => {
  const result = await verifyEmailConfig();
  res.json({
    configured: result.configured,
    error: result.error ?? null,
  });
});

router.post("/admin/email/test", async (req, res) => {
  const { z } = await import("zod");
  const body = z.object({ to: z.string().email() }).parse(req.body);
  const result = await sendEmail(
    body.to,
    "Trivenix Partners — Email Configuration Test",
    "<h1>Email configuration test</h1><p>This is a test email from Trivenix Partners to confirm your SMTP configuration is working.</p>",
    "Email configuration test — Trivenix Partners",
  );
  res.json({ success: result.success, error: result.error ?? null });
});

// ---------- Audit logs ----------

router.get("/admin/audit-logs", async (req, res) => {
  const query = ListAdminAuditLogsQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(auditLogsTable)
    .where(query.q ? or(ilike(auditLogsTable.action, `%${query.q}%`), ilike(auditLogsTable.actorId, `%${query.q}%`)) : undefined)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(200);
  res.json(ListAdminAuditLogsResponse.parse(rows));
});

// ---------- Admin user management (secure, no public registration) ----------

// Bootstrap first admin if none exists (one-time, env-driven)
router.post("/admin/bootstrap", async (_req, res) => {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!bootstrapEmail || !bootstrapPassword) {
    res.status(400).json({ message: "Bootstrap not configured" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, bootstrapEmail.toLowerCase()));
  if (existing) {
    res.status(409).json({ message: "Admin already exists" });
    return;
  }
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.default.hash(bootstrapPassword, 10);
  const [user] = await db.insert(usersTable).values({
    email: bootstrapEmail.toLowerCase(),
    passwordHash,
    role: "ADMIN",
  }).returning();
  await recordAuditLog(String(user.id), "admin.bootstrap", { adminId: user.id });
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

// Provide CSRF token for authenticated admin
router.get("/admin/csrf-token", requireRole("ADMIN"), (req, res) => {
  const token = (req as any).session.csrfToken;
  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json({ csrfToken: token });
});

export default router;
