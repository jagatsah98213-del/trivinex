import nodemailer, { type Transporter, type SentMessageInfo } from "nodemailer";

type EmailResult = { success: boolean; error?: string };

let transport: Transporter | null = null;
let transportError: string | null = null;

function getTransport(): Transporter | null {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transportError = "SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)";
    return null;
  }
  if (transport) return transport;
  const isSecure = Number(process.env.SMTP_PORT) === 465;
  try {
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: isSecure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      // Never disable certificate verification in production.
      tls: { rejectUnauthorized: true },
    });
    transportError = null;
  } catch (err) {
    transportError = err instanceof Error ? err.message : "Failed to create SMTP transport";
    transport = null;
  }
  return transport;
}

/** Verify SMTP connectivity. Returns status without exposing credentials. */
export async function verifyEmailConfig(): Promise<{ configured: boolean; error?: string }> {
  const t = getTransport();
  if (!t) {
    return { configured: false, error: transportError ?? "SMTP not configured" };
  }
  try {
    await t.verify();
    return { configured: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { configured: false, error: "SMTP verification failed" };
  }
}

export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured – message not sent:", { to, subject });
    return { success: false, error: "SMTP not configured" };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    const info: SentMessageInfo = await transport.sendMail({
      from,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });
    console.info(`[email] Sent "${subject}" → ${to} (messageId: ${info.messageId})`);
    return { success: true };
  } catch (err) {
    // Log a sanitized error — never include credentials, full message content, or secrets.
    console.error("[email] Failed to send email:", { to, subject, error: err instanceof Error ? err.message : String(err) });
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

// ─── Templates ────────────────────────────────────────────────────────────────

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayValue(value: string | null | undefined) {
  return escapeHtml(value || "Not provided");
}

function emailShell(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#F5F5F7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  .wrap { max-width:580px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.07); }
  .header { background:#06060A; padding:36px 40px; text-align:center; }
  .logo { color:#fff; font-size:20px; font-weight:800; letter-spacing:-0.5px; }
  .logo span { color:#60A5FA; }
  .body { padding:40px; }
  h1 { font-size:24px; font-weight:800; color:#1D1D1F; margin-bottom:8px; letter-spacing:-0.5px; }
  .sub { color:#6E6E73; font-size:15px; margin-bottom:28px; line-height:1.5; }
  .card { background:#F5F5F7; border-radius:12px; padding:20px 24px; margin-bottom:24px; }
  .card p { color:#1D1D1F; font-size:14px; line-height:1.7; }
  .card strong { color:#1D1D1F; }
  .divider { height:1px; background:#E8E8ED; margin:24px 0; }
  .cta { display:inline-block; background:#1D1D1F; color:#fff !important; padding:14px 28px; border-radius:100px; font-size:14px; font-weight:700; text-decoration:none; margin:8px 0 24px; }
  .footer-text { color:#8E8E9A; font-size:12px; line-height:1.7; }
  .footer { background:#F5F5F7; border-top:1px solid #E8E8ED; padding:24px 40px; text-align:center; }
  .footer p { color:#8E8E9A; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">TRIVINEX<span> PARTNERS</span></div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Trivenix Partners · All rights reserved</p>
    <p style="margin-top:4px;">You received this because you submitted a form on our website.</p>
  </div>
</div>
</body>
</html>`;
}

export function clientInquiryConfirmationEmail(name: string, serviceNeeded: string | null) {
  return emailShell(`
    <h1>We've received your request</h1>
    <p class="sub">Hi ${escapeHtml(name)}, thank you for reaching out to Trivenix Partners.</p>
    <div class="card">
      <p><strong>Service requested:</strong> ${serviceNeeded ? escapeHtml(serviceNeeded.replace(/_/g, " ")) : "Not specified — general inquiry"}</p>
      <p style="margin-top:10px;">Your inquiry has been logged and a member of our team will review it shortly.</p>
    </div>
    <p style="color:#6E6E73;font-size:14px;line-height:1.7;margin-bottom:20px;">
      While you wait, feel free to explore our portfolio and learn more about what we do. If your project is urgent, you can also book a free consultation call directly.
    </p>
    <div class="divider"></div>
    <p class="footer-text">
      <strong>What happens next?</strong><br/>
      1. Our team reviews your project brief<br/>
      2. We'll send you a tailored proposal &amp; pricing<br/>
      3. We schedule a kickoff call to get started
    </p>
  `);
}

export function inquiryAdminNotificationEmail(inquiry: {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  serviceNeeded: string | null;
  projectDetails: string;
  budgetRange?: string | null;
  timeline?: string | null;
}) {
  return emailShell(`
    <h1>New quote request</h1>
    <p class="sub">A new client inquiry was submitted on the Trivenix Partners website.</p>
    <div class="card">
      <p><strong>Inquiry #:</strong> ${inquiry.id}</p>
      <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
      <p><strong>Phone:</strong> ${displayValue(inquiry.phone)}</p>
      <p><strong>Service:</strong> ${inquiry.serviceNeeded ? escapeHtml(inquiry.serviceNeeded.replace(/_/g, " ")) : "Not specified — general inquiry"}</p>
      <p><strong>Budget:</strong> ${displayValue(inquiry.budgetRange)}</p>
      <p><strong>Timeline:</strong> ${displayValue(inquiry.timeline)}</p>
    </div>
    <p style="color:#1D1D1F;font-size:14px;line-height:1.7;"><strong>Project details</strong><br/>${escapeHtml(inquiry.projectDetails).replaceAll("\\n", "<br/>")}</p>
  `);
}

export function consultationConfirmationEmail(
  clientName: string,
  slot: { date: string; startTime: string; meetLink?: string | null },
) {
  return emailShell(`
    <h1>Your consultation is booked</h1>
    <p class="sub">Hi ${escapeHtml(clientName)}, thank you for booking a consultation with Trivenix Partners.</p>
    <div class="card">
      <p><strong>Date:</strong> ${escapeHtml(slot.date)}</p>
      <p><strong>Time:</strong> ${escapeHtml(slot.startTime)}</p>
      ${slot.meetLink ? `<p><strong>Meeting link:</strong> <a href="${escapeHtml(slot.meetLink)}">${escapeHtml(slot.meetLink)}</a></p>` : ""}
      <p style="margin-top:10px;">We look forward to speaking with you. If you need to reschedule, reply to this email and our team will help you.</p>
    </div>
  `);
}

export function consultationAdminNotificationEmail(booking: {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string | null;
  slot: { date: string; startTime: string; meetLink?: string | null };
}) {
  return emailShell(`
    <h1>New consultation booking</h1>
    <p class="sub">A client booked a consultation slot on the Trivenix Partners website.</p>
    <div class="card">
      <p><strong>Booking #:</strong> ${booking.id}</p>
      <p><strong>Name:</strong> ${escapeHtml(booking.clientName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(booking.clientEmail)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(booking.clientPhone)}</p>
      <p><strong>Date:</strong> ${escapeHtml(booking.slot.date)}</p>
      <p><strong>Time:</strong> ${escapeHtml(booking.slot.startTime)}</p>
      ${booking.notes ? `<p><strong>Notes:</strong> ${escapeHtml(booking.notes).replaceAll("\\n", "<br/>")}</p>` : ""}
    </div>
  `);
}

// Freelancer application email templates

export function freelancerApplicationConfirmationEmail(fullName: string, serviceCategory: string) {
  return emailShell(`
    <h1>Your application has been received ✅</h1>
    <p class="sub">Hi ${escapeHtml(fullName)}, thank you for your interest in joining Trivinex Partners.</p>
    <div class="card">
      <p><strong>Applied for:</strong> ${escapeHtml(serviceCategory.replace(/_/g, " "))}</p>
      <p style="margin-top:10px;">
        Your application is currently <strong>under review</strong> by our talent team. We carefully evaluate each submission to ensure the best fit for our standards.
      </p>
    </div>
    <p style="color:#6E6E73;font-size:14px;line-height:1.7;margin-bottom:20px;">
      Shortly, we will contact you on this same email address to inform you of the outcome of your application. Please keep an eye on your inbox — and your spam folder just in case.
    </p>
    <div class="divider"></div>
    <p class="footer-text">
      <strong>What to expect:</strong><br/>
      1. Application review<br/>
      2. Outcome communicated via email<br/>
      3. Next steps if shortlisted
    </p>
    <div class="divider"></div>
    <p class="footer-text">
      We appreciate your patience. If you have any questions in the meantime, feel free to reach out to us directly.
    </p>
  `);
}

export function applicantAdminNotificationEmail(applicant: {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  serviceCategory: string;
  yearsExperience?: number | null;
  availability?: string | null;
  expectedRate?: string | null;
  coverNote?: string | null;
  resumeUrl?: string | null;
}) {
  return emailShell(`
    <h1>New freelancer application</h1>
    <p class="sub">A new freelancer application was submitted on the Trivinex Partners website.</p>
    <div class="card">
      <p><strong>Application #:</strong> ${applicant.id}</p>
      <p><strong>Name:</strong> ${escapeHtml(applicant.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(applicant.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(applicant.phone)}</p>
      <p><strong>Category:</strong> ${escapeHtml(applicant.serviceCategory.replace(/_/g, " "))}</p>
      <p><strong>Experience:</strong> ${applicant.yearsExperience ?? "Not provided"}</p>
      <p><strong>Availability:</strong> ${applicant.availability ?? "Not provided"}</p>
      <p><strong>Expected rate:</strong> ${applicant.expectedRate ?? "Not provided"}</p>
      ${applicant.resumeUrl ? `<p><strong>Resume:</strong> <a href="${escapeHtml(applicant.resumeUrl)}">${escapeHtml(applicant.resumeUrl)}</a></p>` : ""}
    </div>
    ${applicant.coverNote ? `<p style="color:#1D1D1F;font-size:14px;line-height:1.7;"><strong>Cover note</strong><br/>${escapeHtml(applicant.coverNote).replaceAll("\\n", "<br/>")}</p>` : ""}
  `);
}
