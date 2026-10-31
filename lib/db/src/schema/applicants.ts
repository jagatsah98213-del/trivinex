import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoryEnum, payoutMethodEnum, applicantStatusEnum } from "./enums";

export const applicantsTable = pgTable("applicants", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceCategory: serviceCategoryEnum("service_category").notNull(),
  portfolioLinks: jsonb("portfolio_links").$type<string[]>().notNull().default([]),
  yearsExperience: integer("years_experience"),
  equipmentOwned: text("equipment_owned"),
  availability: text("availability"),
  expectedRate: text("expected_rate"),
  preferredPayout: payoutMethodEnum("preferred_payout"),
  coverNote: text("cover_note"),
  resumeUrl: text("resume_url"),
  status: applicantStatusEnum("status").notNull().default("applied"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApplicantSchema = createInsertSchema(applicantsTable).omit({ id: true, status: true, adminNotes: true, createdAt: true });
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Applicant = typeof applicantsTable.$inferSelect;
