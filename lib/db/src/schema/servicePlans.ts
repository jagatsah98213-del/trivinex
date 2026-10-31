import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { servicesTable } from "./services";
import { planBadgeEnum, pricingTypeEnum } from "./enums";

export const servicePlansTable = pgTable("service_plans", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pricingType: pricingTypeEnum("pricing_type").notNull().default("ONE_TIME"),
  // Indicative price label (e.g. "Request a quote", "Starting at NPR 10,000").
  // Left blank / "Request a quote" until the owner sets real prices.
  priceLabel: text("price_label"),
  badge: planBadgeEnum("badge").notNull().default("NONE"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type ServicePlan = typeof servicePlansTable.$inferSelect;
export type InsertServicePlan = typeof servicePlansTable.$inferInsert;
