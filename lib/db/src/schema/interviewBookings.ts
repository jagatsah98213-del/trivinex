import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicantsTable } from "./applicants";
import { slotsTable } from "./slots";
import { interviewBookingStatusEnum } from "./enums";

export const interviewBookingsTable = pgTable("interview_bookings", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicantsTable.id),
  slotId: integer("slot_id").notNull().references(() => slotsTable.id),
  status: interviewBookingStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInterviewBookingSchema = createInsertSchema(interviewBookingsTable).omit({ id: true, status: true, createdAt: true });
export type InsertInterviewBooking = z.infer<typeof insertInterviewBookingSchema>;
export type InterviewBooking = typeof interviewBookingsTable.$inferSelect;
