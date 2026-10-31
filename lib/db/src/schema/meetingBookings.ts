import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { slotsTable } from "./slots";
import { meetingBookingStatusEnum } from "./enums";

export const meetingBookingsTable = pgTable("meeting_bookings", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull().references(() => slotsTable.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  notes: text("notes"),
  status: meetingBookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMeetingBookingSchema = createInsertSchema(meetingBookingsTable).omit({ id: true, status: true, createdAt: true });
export type InsertMeetingBooking = z.infer<typeof insertMeetingBookingSchema>;
export type MeetingBooking = typeof meetingBookingsTable.$inferSelect;
