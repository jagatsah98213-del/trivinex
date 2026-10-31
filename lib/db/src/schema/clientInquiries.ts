import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoryEnum, inquiryStatusEnum, inquiryEmailStatusEnum } from "./enums";

export const clientInquiriesTable = pgTable("client_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  business: text("business"),
  // One or more service divisions of interest (stored as the primary category;
  // additional selections are captured in projectDetails). Nullable for general inquiries.
  serviceNeeded: serviceCategoryEnum("service_needed"),
  projectDetails: text("project_details").notNull(),
  budgetRange: text("budget_range"),
  currency: text("currency"), // NPR / INR / USD
  timeline: text("timeline"),
  preferredContactMethod: text("preferred_contact_method"),
  servicePlanId: integer("service_plan_id"),
  status: inquiryStatusEnum("status").notNull().default("new"),
  // Email delivery tracking
  emailStatus: inquiryEmailStatusEnum("email_status").notNull().default("not_sent"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClientInquirySchema = createInsertSchema(clientInquiriesTable).omit({
  id: true,
  status: true,
  emailStatus: true,
  emailSentAt: true,
  createdAt: true,
});
export type InsertClientInquiry = z.infer<typeof insertClientInquirySchema>;
export type ClientInquiry = typeof clientInquiriesTable.$inferSelect;
