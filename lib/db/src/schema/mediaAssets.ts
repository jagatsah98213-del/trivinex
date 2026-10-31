import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mediaAssetsTable = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  // Original file name
  fileName: text("file_name").notNull(),
  // MIME type
  mimeType: text("mime_type").notNull(),
  // File size in bytes
  fileSize: integer("file_size").notNull(),
  // Durable public URL (Cloudinary or other provider)
  url: text("url").notNull(),
  // Secure/private URL if available (for replacement/delete)
  secureUrl: text("secure_url"),
  // Provider-specific public ID for management (replace/delete)
  publicId: text("public_id"),
  // Provider name (cloudinary, etc.)
  provider: text("provider").notNull().default("cloudinary"),
  // Width/height for images, duration for video
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  // Alt/caption text
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssetsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssetsTable.$inferSelect;
