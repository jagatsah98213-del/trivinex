import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoryEnum, testimonialVideoSourceEnum } from "./enums";

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  // Display name / client or business name (optional)
  clientName: text("client_name"),
  roleOrCompany: text("role_or_company"),
  // Approved testimonial text/quote
  quote: text("quote").notNull(),
  // Optional rating (1-5, not forced)
  rating: integer("rating"),
  // Optional avatar/thumbnail/poster image URL
  avatarUrl: text("avatar_url"),
  // Video source type: uploaded file, YouTube, Vimeo or safe external video URL
  videoSource: testimonialVideoSourceEnum("video_source"),
  // Video URL / persistent media URL
  videoUrl: text("video_url"),
  // Separate related live demo website URL (distinct from video URL)
  demoUrl: text("demo_url"),
  // Demo button label (e.g. "View live demo")
  demoButtonLabel: text("demo_button_label"),
  // Related service category
  serviceCategory: serviceCategoryEnum("service_category"),
  // Optional related portfolio item
  relatedPortfolioId: integer("related_portfolio_id"),
  // Caption/alt text
  caption: text("caption"),
  // Published/draft status
  isPublished: boolean("is_published").notNull().default(false),
  // Sort order
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsTable.$inferSelect;
