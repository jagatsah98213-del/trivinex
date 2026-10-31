import { pgTable, text, serial, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoryEnum, payoutMethodEnum } from "./enums";
import { usersTable } from "./users";
import { applicantsTable } from "./applicants";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").references(() => applicantsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceCategory: serviceCategoryEnum("service_category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  payoutMethod: payoutMethodEnum("payout_method"),
  payoutDetails: jsonb("payout_details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
