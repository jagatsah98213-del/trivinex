import { db, servicesTable, servicePlansTable, testimonialsTable, portfolioItemsTable, usersTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { eq } from "drizzle-orm";

/**
 * Seed script for Trivenix Partners.
 *
 * Idempotent: safe to re-run. Only inserts when tables are empty.
 *
 * Security: does NOT seed a default admin password. The first admin must be
 * created via ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD and the
 * /api/admin/bootstrap endpoint.
 *
 * Authenticity: does NOT seed fabricated testimonials, portfolio work, prices,
 * or customer claims. The public site shows an elegant "coming soon" state
 * until the owner adds genuine approved material.
 */

const EIGHT_SERVICE_DIVISIONS = [
  {
    category: "WEB_DEVELOPMENT" as const,
    title: "Web Development",
    slug: "web-development",
    description: "Business and corporate websites, portfolio sites, restaurant and hotel sites, clinic and education sites, startup sites, e-commerce, landing pages, custom web applications, redesign and maintenance.",
    longDescription: "We build websites and web applications tailored to your business — from simple brochure sites to fully custom web applications. Choose between pre-built solutions for speed and affordability, or fully customized solutions built around your exact requirements.",
    sortOrder: 1,
  },
  {
    category: "VIDEO_EDITING" as const,
    title: "Video Editing",
    slug: "video-editing",
    description: "Wedding edits, YouTube long-form, Shorts/Reels/TikTok, business promos, product videos, cinematic and corporate videos, color grading, motion graphics, and captions.",
    sortOrder: 2,
  },
  {
    category: "PHOTOGRAPHY" as const,
    title: "Photography",
    slug: "photography",
    description: "Business, product, restaurant, hotel, event, wedding, portrait, social-media and promotional photography. Location-based depending on professional availability.",
    sortOrder: 3,
  },
  {
    category: "VIDEOGRAPHY" as const,
    title: "Videography",
    slug: "videography",
    description: "Weddings and events, business promotional videos, restaurant/hotel and product videos, interviews, social-media content, music videos, corporate content and campaigns.",
    sortOrder: 4,
  },
  {
    category: "GRAPHIC_DESIGN" as const,
    title: "Graphic Design",
    slug: "graphic-design",
    description: "Logo and brand identity, social media graphics, posters, flyers, business cards, banners, advertisements, YouTube thumbnails, product graphics, and presentation graphics.",
    sortOrder: 5,
  },
  {
    category: "SCRIPT_CONTENT_WRITING" as const,
    title: "Script & Content Writing",
    slug: "script-content-writing",
    description: "YouTube and short-form scripts, advertisement scripts, business and website content, social-media captions, educational content, video concepts and storytelling.",
    sortOrder: 6,
  },
  {
    category: "SEO" as const,
    title: "SEO",
    slug: "seo",
    description: "Website SEO, keyword research, on-page SEO, technical SEO, local SEO, Google Business Profile optimization, content optimization, SEO strategy, audits, and ongoing management. We never guarantee a particular search ranking.",
    sortOrder: 7,
  },
  {
    category: "DIGITAL_MARKETING" as const,
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Social-media marketing and strategy, campaign planning, digital advertising, promotional campaigns, content strategy, audience development, and marketing consultation. Distinct from SEO.",
    sortOrder: 8,
  },
];

// Starter plan categories (descriptive names only — no prices, no badges implying popularity)
const STARTER_PLANS: Record<string, Array<{ name: string; description: string; pricingType: "ONE_TIME" | "MONTHLY" | "OTHER"; sortOrder: number }>> = {
  WEB_DEVELOPMENT: [
    { name: "Starter Website", description: "A clean, professional site ideal for small businesses needing an online presence fast.", pricingType: "ONE_TIME", sortOrder: 1 },
    { name: "Custom Web Development", description: "Fully bespoke design and functionality — booking systems, dashboards, integrations.", pricingType: "ONE_TIME", sortOrder: 2 },
    { name: "E-commerce Website", description: "Full online store with product catalog, cart, and checkout.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Monthly Website Management", description: "Ongoing updates, content edits, security monitoring, and hosting support.", pricingType: "MONTHLY", sortOrder: 4 },
  ],
  VIDEO_EDITING: [
    { name: "Reel & Short-Form Editing", description: "Fast-turnaround edits for Instagram Reels, YouTube Shorts, and TikTok.", pricingType: "ONE_TIME", sortOrder: 1 },
    { name: "Long-Form Video Editing", description: "Full YouTube videos, vlogs, and podcast episode edits.", pricingType: "ONE_TIME", sortOrder: 2 },
    { name: "Wedding Video Editing", description: "Cinematic edits of wedding footage into a highlight film and full-ceremony cut.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Corporate & Promo Video Editing", description: "Polished edits for ads, product launches, and internal company videos.", pricingType: "ONE_TIME", sortOrder: 4 },
  ],
  PHOTOGRAPHY: [
    { name: "Event Photography", description: "Weddings, parties, and corporate event coverage.", pricingType: "ONE_TIME", sortOrder: 1 },
    { name: "Product Photography", description: "Clean, e-commerce-ready product shots.", pricingType: "ONE_TIME", sortOrder: 2 },
    { name: "Portrait & Personal Branding", description: "Professional headshots and personal brand photo sets.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Wedding Photography", description: "Full-day wedding photography coverage.", pricingType: "ONE_TIME", sortOrder: 4 },
  ],
  VIDEOGRAPHY: [
    { name: "Wedding Videography", description: "Full-day wedding filming and highlight films.", pricingType: "ONE_TIME", sortOrder: 1 },
    { name: "Event Videography", description: "Event coverage and highlight videos.", pricingType: "ONE_TIME", sortOrder: 2 },
    { name: "Business Promotional Video", description: "Promotional videos for restaurants, hotels, and products.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Product/Interview/Social Content", description: "Product videos, interviews, and social-media content.", pricingType: "ONE_TIME", sortOrder: 4 },
  ],
  GRAPHIC_DESIGN: [
    { name: "Logo & Brand Identity", description: "Logo design plus a basic brand kit (colors, fonts, usage guide).", pricingType: "ONE_TIME", sortOrder: 1 },
    { name: "Social Media Creative Pack", description: "Recurring batch of on-brand social post designs.", pricingType: "MONTHLY", sortOrder: 2 },
    { name: "Print & Packaging Design", description: "Business cards, brochures, posters, and product packaging.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Custom Design Project", description: "One-off design work that doesn't fit a standard package.", pricingType: "ONE_TIME", sortOrder: 4 },
  ],
  SCRIPT_CONTENT_WRITING: [
    { name: "Blog & Article Writing", description: "Regular blog content to keep your site active and searchable.", pricingType: "MONTHLY", sortOrder: 1 },
    { name: "Website Copywriting", description: "One-time copy for a full website — homepage, about, service pages.", pricingType: "ONE_TIME", sortOrder: 2 },
    { name: "SEO Content Writing", description: "Keyword-optimized articles built to rank in search.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Social Media Captions & Content", description: "Ongoing caption and content writing for social channels.", pricingType: "MONTHLY", sortOrder: 4 },
    { name: "YouTube/Short-form Scriptwriting", description: "Scripts for YouTube videos and short-form content.", pricingType: "ONE_TIME", sortOrder: 5 },
  ],
  SEO: [
    { name: "SEO Audit & On-Page Optimization", description: "One-time technical and on-page SEO review and fix-up.", pricingType: "ONE_TIME", sortOrder: 1 },
    { name: "Monthly SEO Management", description: "Ongoing keyword tracking, content optimization, and link building.", pricingType: "MONTHLY", sortOrder: 2 },
    { name: "Local SEO / Google Business Profile", description: 'Optimizing for "near me" searches and local map rankings.', pricingType: "ONE_TIME", sortOrder: 3 },
  ],
  DIGITAL_MARKETING: [
    { name: "Social Media Strategy/Management", description: "Social-media marketing strategy and ongoing management.", pricingType: "MONTHLY", sortOrder: 1 },
    { name: "Paid Ads Management", description: "Google and Meta ad campaign setup and ongoing management.", pricingType: "MONTHLY", sortOrder: 2 },
    { name: "Campaign Planning", description: "Promotional campaign planning and execution.", pricingType: "ONE_TIME", sortOrder: 3 },
    { name: "Content Strategy", description: "Content strategy and audience development planning.", pricingType: "ONE_TIME", sortOrder: 4 },
  ],
};

async function seed() {
  // 1. Services (only if empty)
  const existingServices = await db.select().from(servicesTable).limit(1);
  if (existingServices.length === 0) {
    await db.insert(servicesTable).values(EIGHT_SERVICE_DIVISIONS);
    logger.info("Seeded 8 service divisions");
  }

  // 2. Service plans (only if empty)
  const existingPlans = await db.select().from(servicePlansTable).limit(1);
  if (existingPlans.length === 0) {
    const allServices = await db.select().from(servicesTable);
    const servicesByCategory: Record<string, number> = Object.fromEntries(allServices.map((s) => [s.category, s.id]));
    const planRows = Object.entries(STARTER_PLANS).flatMap(([category, plans]) => {
      const serviceId = servicesByCategory[category];
      if (!serviceId) return [];
      return plans.map((p) => ({ ...p, serviceId, priceLabel: "Request a quote" }));
    });
    await db.insert(servicePlansTable).values(planRows);
    logger.info("Seeded starter service plans");
  }

  // 3. No default testimonials — do not fabricate customer claims.
  // 4. No default portfolio items — do not fabricate client work.
  // 5. No default admin account — bootstrap via env vars + /api/admin/bootstrap.

  logger.info("Seed complete — no testimonials, portfolio, prices, or default admin seeded");

  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
