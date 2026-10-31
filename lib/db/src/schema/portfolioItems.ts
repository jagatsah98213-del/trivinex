import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoryEnum, portfolioMediaTypeEnum } from "./enums";

export const portfolioItemsTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  serviceCategory: serviceCategoryEnum("service_category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  // Optional client/business name only where approved for public use
  clientName: text("client_name"),
  mediaType: portfolioMediaTypeEnum("media_type").notNull(),
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  // Separate live website URL (distinct from media URL)
  liveDemoUrl: text("live_demo_url"),
  // Demo button label
  demoButtonLabel: text("demo_button_label"),
  // Caption/alt text
  caption: text("caption"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItemsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItemsTable.$inferSelect;
