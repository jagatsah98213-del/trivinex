import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";
import { employeesTable } from "./employees";
import { assignmentStatusEnum } from "./enums";

export const projectAssignmentsTable = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id),
  employeeId: integer("employee_id").notNull().references(() => employeesTable.id),
  status: assignmentStatusEnum("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectAssignmentSchema = createInsertSchema(projectAssignmentsTable).omit({ id: true, status: true, assignedAt: true });
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;
export type ProjectAssignment = typeof projectAssignmentsTable.$inferSelect;
