import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const weeklyScheduleRulesTable = pgTable("weekly_schedule_rules", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: text("start_time").notNull(),     // "HH:MM" 24-hour format
  meetLink: text("meet_link"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WeeklyScheduleRule = typeof weeklyScheduleRulesTable.$inferSelect;
export type InsertWeeklyScheduleRule = typeof weeklyScheduleRulesTable.$inferInsert;
