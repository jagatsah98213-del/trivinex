import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "EMPLOYEE"]);

export const payoutMethodEnum = pgEnum("payout_method", [
  "BANK_TRANSFER",
  "PHONEPE",
  "PAYPAL",
  "ESEWA",
]);

export const slotPurposeEnum = pgEnum("slot_purpose", [
  "INTERVIEW",
  "CLIENT_MEETING",
]);

/**
 * Eight distinct service divisions.
 *
 * Legacy combined categories (PHOTOGRAPHY_VIDEOGRAPHY, SEO_DIGITAL_MARKETING)
 * have been split. CONTENT_WRITING was renamed to SCRIPT_CONTENT_WRITING to
 * match the report's "Script & Content Writing" division.
 *
 * Old combined enum values are retained below only as migration compatibility
 * so existing rows are not orphaned. The public API and seed data only use the
 * eight current divisions.
 */
export const serviceCategoryEnum = pgEnum("service_category", [
  "WEB_DEVELOPMENT",
  "VIDEO_EDITING",
  "PHOTOGRAPHY",
  "VIDEOGRAPHY",
  "GRAPHIC_DESIGN",
  "SCRIPT_CONTENT_WRITING",
  "SEO",
  "DIGITAL_MARKETING",
  // --- Migration compatibility (do not use in new code) ---
  "PHOTOGRAPHY_VIDEOGRAPHY",
  "SEO_DIGITAL_MARKETING",
  "CONTENT_WRITING",
]);

export const applicantStatusEnum = pgEnum("applicant_status", [
  "applied",
  "interview_scheduled",
  "interviewed",
  "selected",
  "rejected",
]);

export const interviewBookingStatusEnum = pgEnum("interview_booking_status", [
  "scheduled",
  "completed",
  "no_show",
  "cancelled",
]);

export const meetingBookingStatusEnum = pgEnum("meeting_booking_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "in_discussion",
  "quoted",
  "won",
  "closed",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "new",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "assigned",
  "in_progress",
  "submitted",
  "approved",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid"]);

export const portfolioMediaTypeEnum = pgEnum("portfolio_media_type", [
  "image",
  "video",
  "link",
]);

export const planBadgeEnum = pgEnum("plan_badge", [
  "NONE",
  "HOT",
  "NEW",
  "POPULAR",
  "BEST_VALUE",
]);

export const pricingTypeEnum = pgEnum("pricing_type", [
  "ONE_TIME",
  "MONTHLY",
  "OTHER",
]);

export const testimonialVideoSourceEnum = pgEnum("testimonial_video_source", [
  "upload",
  "youtube",
  "vimeo",
  "external",
]);

export const inquiryEmailStatusEnum = pgEnum("inquiry_email_status", [
  "not_sent",
  "sent",
  "failed",
]);
