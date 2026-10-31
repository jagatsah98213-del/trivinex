import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoryEnum, projectStatusEnum } from "./enums";
import { clientInquiriesTable } from "./clientInquiries";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").references(() => clientInquiriesTable.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  serviceCategory: serviceCategoryEnum("service_category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("new"),
  deadline: timestamp("deadline", { withTimezone: true }),
  deliverableUrl: text("deliverable_url"),
  clientPaymentReceived: boolean("client_payment_received").notNull().default(false),
  clientPaymentAmount: integer("client_payment_amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, status: true, deliverableUrl: true, clientPaymentReceived: true, clientPaymentAmount: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
