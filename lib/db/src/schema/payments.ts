import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { employeesTable } from "./employees";
import { projectsTable } from "./projects";
import { payoutMethodEnum, paymentStatusEnum } from "./enums";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id),
  employeeId: integer("employee_id").notNull().references(() => employeesTable.id),
  amount: integer("amount").notNull(),
  method: payoutMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  referenceNote: text("reference_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, status: true, paidAt: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
