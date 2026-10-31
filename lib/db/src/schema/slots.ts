import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { slotPurposeEnum } from "./enums";

export const slotsTable = pgTable("slots", {
  id: serial("id").primaryKey(),
  purpose: slotPurposeEnum("purpose").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  capacity: integer("capacity").notNull().default(1),
  booked: integer("booked").notNull().default(0),
  meetLink: text("meet_link"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSlotSchema = createInsertSchema(slotsTable).omit({ id: true, booked: true, createdAt: true });
export type InsertSlot = z.infer<typeof insertSlotSchema>;
export type Slot = typeof slotsTable.$inferSelect;
