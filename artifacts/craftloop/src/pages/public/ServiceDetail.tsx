import React from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { useListPublicServices } from "@workspace/api-client-react";
import {
  ArrowLeft, ArrowRight, Loader2,
  Code, Video, Camera, Palette, PenTool, TrendingUp, Zap, Film,
  Monitor, Aperture, Brush, FileText, BarChart2,
} from "lucide-react";

// ── Per-service meta (icon + hero gradient) ───────────────────────────────────
const SERVICE_META: Record<string, { icon: React.ElementType; gradient: string; glow: string }> = {
  WEB_DEVELOPMENT:         { icon: Code,       gradient: "from-blue-500 to-blue-600",    glow: "bg-blue-600/10" },
  VIDEO_EDITING:           { icon: Video,      gradient: "from-purple-500 to-purple-600", glow: "bg-purple-600/10" },
  PHOTOGRAPHY:             { icon: Camera,     gradient: "from-pink-500 to-rose-600",    glow: "bg-pink-600/10" },
  VIDEOGRAPHY:             { icon: Film,       gradient: "from-indigo-500 to-indigo-600", glow: "bg-indigo-600/10" },
  GRAPHIC_DESIGN:          { icon: Palette,    gradient: "from-orange-500 to-amber-600", glow: "bg-orange-600/10" },
  SCRIPT_CONTENT_WRITING:  { icon: PenTool,    gradient: "from-green-500 to-emerald-600",glow: "bg-green-600/10" },
  SEO:                     { icon: TrendingUp, gradient: "from-cyan-500 to-teal-600",   glow: "bg-cyan-600/10" },
  DIGITAL_MARKETING:       { icon: Zap,        gradient: "from-amber-500 to-orange-600", glow: "bg-amber-600/10" },
  // Legacy combined categories (migration compatibility)
  PHOTOGRAPHY_VIDEOGRAPHY: { icon: Camera,     gradient: "from-pink-500 to-rose-600",    glow: "bg-pink-600/10" },
  SEO_DIGITAL_MARKETING:   { icon: TrendingUp, gradient: "from-cyan-500 to-teal-600",   glow: "bg-cyan-600/10" },
  CONTENT_WRITING:         { icon: PenTool,    gradient: "from-green-500 to-emerald-600",glow: "bg-green-600/10" },
};

// ── Per-service plan section theme ─────────────────────────────────────────────
const SERVICE_THEME: Record<string, {
  sectionBg: string;
  accentText: string;
  accentBorder: string;
  featuredRing: string;
  ctaBase: string;
  ctaFeatured: string;
  pricingTypeMonthly: string;
  pricingTypeOnce: string;
  tagline: string;
  decorIcon: React.ElementType;
  decorLabel: string;
}> = {
  WEB_DEVELOPMENT: {
    sectionBg: "bg-[#EFF4FF]",
    accentText: "text-blue-600",
    accentBorder: "border-blue-500",
    featuredRing: "from-blue-500 to-indigo-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-blue-700",
    ctaFeatured: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
    pricingTypeMonthly: "bg-indigo-50 text-indigo-700 border-indigo-200",
    pricingTypeOnce: "bg-blue-50 text-blue-700 border-blue-200",
    tagline: "Engineered for performance & conversion",
    decorIcon: Monitor,
    decorLabel: "Full-Stack Web",
  },
  VIDEO_EDITING: {
    sectionBg: "bg-[#F6F0FF]",
    accentText: "text-purple-600",
    accentBorder: "border-purple-500",
    featuredRing: "from-purple-500 to-violet-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-purple-700",
    ctaFeatured: "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
    pricingTypeMonthly: "bg-violet-50 text-violet-700 border-violet-200",
    pricingTypeOnce: "bg-purple-50 text-purple-700 border-purple-200",
    tagline: "Cinematic quality, every cut",
    decorIcon: Film,
    decorLabel: "Post-Production",
  },
  PHOTOGRAPHY_VIDEOGRAPHY: {
    sectionBg: "bg-[#FFF0F5]",
    accentText: "text-pink-600",
    accentBorder: "border-pink-500",
    featuredRing: "from-pink-500 to-rose-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-pink-700",
    ctaFeatured: "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40",
    pricingTypeMonthly: "bg-rose-50 text-rose-700 border-rose-200",
    pricingTypeOnce: "bg-pink-50 text-pink-700 border-pink-200",
    tagline: "Every shot tells your story",
    decorIcon: Aperture,
    decorLabel: "On-Location & Studio",
  },
  GRAPHIC_DESIGN: {
    sectionBg: "bg-[#FFF8F0]",
    accentText: "text-orange-600",
    accentBorder: "border-orange-400",
    featuredRing: "from-orange-500 to-amber-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-orange-600",
    ctaFeatured: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-400/25 hover:shadow-orange-400/40",
    pricingTypeMonthly: "bg-amber-50 text-amber-700 border-amber-200",
    pricingTypeOnce: "bg-orange-50 text-orange-700 border-orange-200",
    tagline: "Design that leaves a lasting impression",
    decorIcon: Brush,
    decorLabel: "Brand & Creative",
  },
  CONTENT_WRITING: {
    sectionBg: "bg-[#F0FFF5]",
    accentText: "text-green-600",
    accentBorder: "border-green-500",
    featuredRing: "from-green-500 to-emerald-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-green-700",
    ctaFeatured: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
    pricingTypeMonthly: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pricingTypeOnce: "bg-green-50 text-green-700 border-green-200",
    tagline: "Words that rank, convert, and resonate",
    decorIcon: FileText,
    decorLabel: "Copy & Content Strategy",
  },
  PHOTOGRAPHY: {
    sectionBg: "bg-[#FFF0F5]",
    accentText: "text-pink-600",
    accentBorder: "border-pink-500",
    featuredRing: "from-pink-500 to-rose-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-pink-700",
    ctaFeatured: "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40",
    pricingTypeMonthly: "bg-rose-50 text-rose-700 border-rose-200",
    pricingTypeOnce: "bg-pink-50 text-pink-700 border-pink-200",
    tagline: "Every shot tells your story",
    decorIcon: Aperture,
    decorLabel: "Photography",
  },
  VIDEOGRAPHY: {
    sectionBg: "bg-[#F0F0FF]",
    accentText: "text-indigo-600",
    accentBorder: "border-indigo-500",
    featuredRing: "from-indigo-500 to-blue-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-indigo-700",
    ctaFeatured: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40",
    pricingTypeMonthly: "bg-indigo-50 text-indigo-700 border-indigo-200",
    pricingTypeOnce: "bg-blue-50 text-blue-700 border-blue-200",
    tagline: "Motion that moves people",
    decorIcon: Film,
    decorLabel: "Videography",
  },
  SCRIPT_CONTENT_WRITING: {
    sectionBg: "bg-[#F0FFF5]",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-500",
    featuredRing: "from-emerald-500 to-green-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-emerald-700",
    ctaFeatured: "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
    pricingTypeMonthly: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pricingTypeOnce: "bg-green-50 text-green-700 border-green-200",
    tagline: "Stories worth telling",
    decorIcon: FileText,
    decorLabel: "Script & Content",
  },
  SEO: {
    sectionBg: "bg-[#F0FEFF]",
    accentText: "text-teal-600",
    accentBorder: "border-teal-500",
    featuredRing: "from-teal-500 to-cyan-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-teal-700",
    ctaFeatured: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40",
    pricingTypeMonthly: "bg-teal-50 text-teal-700 border-teal-200",
    pricingTypeOnce: "bg-cyan-50 text-cyan-700 border-cyan-200",
    tagline: "Grow your visibility, measurably",
    decorIcon: BarChart2,
    decorLabel: "SEO",
  },
  DIGITAL_MARKETING: {
    sectionBg: "bg-[#FFF8F0]",
    accentText: "text-orange-600",
    accentBorder: "border-orange-500",
    featuredRing: "from-orange-500 to-amber-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-orange-700",
    ctaFeatured: "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-400/25 hover:shadow-orange-400/40",
    pricingTypeMonthly: "bg-amber-50 text-amber-700 border-amber-200",
    pricingTypeOnce: "bg-orange-50 text-orange-700 border-orange-200",
    tagline: "Promote with purpose",
    decorIcon: Zap,
    decorLabel: "Digital Marketing",
  },
  // Legacy combined category (migration compatibility)
  SEO_DIGITAL_MARKETING: {
    sectionBg: "bg-[#F0FEFF]",
    accentText: "text-cyan-700",
    accentBorder: "border-cyan-500",
    featuredRing: "from-cyan-500 to-teal-500",
    ctaBase: "bg-[#1D1D1F] text-white hover:bg-cyan-700",
    ctaFeatured: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40",
    pricingTypeMonthly: "bg-teal-50 text-teal-700 border-teal-200",
    pricingTypeOnce: "bg-cyan-50 text-cyan-700 border-cyan-200",
    tagline: "Grow your visibility, measurably",
    decorIcon: BarChart2,
    decorLabel: "Growth & Analytics",
  },
};

const DEFAULT_THEME = SERVICE_THEME.WEB_DEVELOPMENT;

const BADGE_CONFIG: Record<string, { label: string; pill: string }> = {
  HOT:        { label: "🔥 Hot",        pill: "bg-red-500 text-white" },
  NEW:        { label: "✨ New",        pill: "bg-blue-600 text-white" },
  POPULAR:    { label: "⭐ Popular",    pill: "bg-amber-500 text-white" },
  BEST_VALUE: { label: "💎 Best Value", pill: "bg-purple-600 text-white" },
};

const FEATURED = new Set(["POPULAR", "BEST_VALUE"]);

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any },
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: services, isLoading } = useListPublicServices();

  const service = services?.find((s: any) => s.slug === slug);
  const activePlans =
    (service?.plans as any[] | undefined)
      ?.filter((p: any) => p.isActive)
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder) ?? [];

  const meta = service
    ? (SERVICE_META[service.category as string] ?? { icon: Code, gradient: "from-blue-500 to-blue-600", glow: "bg-blue-600/10" })
    : null;
  const theme = service
    ? (SERVICE_THEME[service.category as string] ?? DEFAULT_THEME)
    : DEFAULT_THEME;
  const Icon = meta?.icon ?? Code;
  const DecorIcon = theme.decorIcon;

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ══════════════════════════════════════════════
           HERO — service-colored glow, dark
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[56vh] flex items-center bg-[#06060A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full ${meta?.glow ?? "bg-blue-600/10"} blur-[120px]`} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-24 pb-24">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/services" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium mb-12 transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-white/30" /></div>
          ) : service && meta ? (
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-2xl shrink-0`}
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">
                  {activePlans.length} Plan{activePlans.length !== 1 ? "s" : ""} Available
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white leading-[1.05] mb-5"
                >
                  {service.title}
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                  className="text-[#8E8E9A] text-lg leading-relaxed max-w-2xl">
                  {service.description}
                </motion.p>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="text-center text-white/40 py-20 text-lg">Service not found.</div>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
           PLAN CARDS — service-specific theme
      ══════════════════════════════════════════════ */}
      <section className={`py-24 ${theme.sectionBg}`}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
          ) : activePlans.length === 0 ? (
            <div className="text-center py-20 text-[#6E6E73] text-lg">No plans available for this service yet.</div>
          ) : (
            <>
              {/* Section header with service-specific accent */}
              <div className="text-center mb-16">
                <motion.div {...fadeUp} className="inline-flex items-center gap-2.5 mb-6">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta?.gradient} flex items-center justify-center shadow`}>
                    <DecorIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.accentText}`}>
                    {theme.decorLabel} · Plans & Pricing
                  </span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                  className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-[#1D1D1F]"
                >
                  Find the right fit
                </motion.h2>
                <motion.p {...fadeUp} className="text-[#6E6E73] mt-3 max-w-md mx-auto">
                  {theme.tagline}. Each plan is a starting point — we customise scope to match your exact requirements.
                </motion.p>
              </div>

              <div
                className={`grid gap-6 mx-auto ${
                  activePlans.length === 1 ? "max-w-sm"
                  : activePlans.length === 2 ? "sm:grid-cols-2 max-w-2xl"
                  : activePlans.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
                  : "sm:grid-cols-2 lg:grid-cols-4 max-w-7xl"
                }`}
              >
                {activePlans.map((plan: any, i: number) => {
                  const badge = plan.badge !== "NONE" ? BADGE_CONFIG[plan.badge] : null;
                  const featured = FEATURED.has(plan.badge);

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ delay: i * 0.1, duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                      className="relative"
                    >
                      {/* Featured glow ring — uses service gradient */}
                      {featured && (
                        <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${theme.featuredRing} opacity-30 blur-sm pointer-events-none`} />
                      )}

                      <div
                        className={`relative bg-white rounded-3xl p-7 h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                          featured
                            ? `border-2 ${theme.accentBorder} shadow-lg`
                            : "border border-[#E8E8ED] shadow-sm hover:border-[#D2D2D7]"
                        }`}
                      >
                        {/* Badge chip */}
                        {badge && (
                          <span className={`absolute top-5 right-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${badge.pill}`}>
                            {badge.label}
                          </span>
                        )}

                        {/* Pricing type pill — service-colored */}
                        <div className="mb-5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            plan.pricingType === "MONTHLY" ? theme.pricingTypeMonthly : theme.pricingTypeOnce
                          }`}>
                            {plan.pricingType === "MONTHLY" ? "Monthly" : "One-time"}
                          </span>
                        </div>

                        {/* Plan name */}
                        <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight mb-3 pr-16 leading-snug">
                          {plan.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[#6E6E73] leading-relaxed flex-1 mb-6">
                          {plan.description}
                        </p>

                        {/* Price */}
                        {plan.startingPrice && (
                          <div className="pb-6 mb-6 border-b border-[#E8E8ED]">
                            <div className={`text-2xl font-extrabold tracking-tight ${featured ? theme.accentText : "text-[#1D1D1F]"}`}>
                              {plan.startingPrice}
                            </div>
                            <div className="text-xs text-[#6E6E73] mt-0.5">
                              {plan.pricingType === "MONTHLY" ? "per month" : "one-time"}
                            </div>
                          </div>
                        )}

                        {/* CTA — service-themed */}
                        <Link
                          href={`/quote?service=${service?.category}&plan=${plan.id}`}
                          className={`inline-flex h-11 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                            featured ? theme.ctaFeatured : theme.ctaBase
                          }`}
                        >
                          Get Started <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Comparison nudge */}
              <motion.div {...fadeUp} className="text-center mt-14">
                <p className="text-sm text-[#6E6E73]">
                  Not sure which plan fits? <Link href="/consultation" className={`font-semibold ${theme.accentText} hover:underline`}>Book a free 30-min call</Link> and we'll recommend the right one.
                </p>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           CTA — Dark
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#06060A] py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full bg-blue-500/15 blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white mb-4 leading-[1.1]">
            Need something custom?
          </motion.h2>
          <motion.p {...fadeUp} className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Our plans are starting points. Book a free call and we'll craft the exact scope you need.
          </motion.p>
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link href="/consultation" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5">
              Book a Free Call
            </Link>
            <Link href="/services" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 text-white px-8 text-sm font-semibold hover:bg-white/[0.06] transition-colors duration-200">
              <ArrowLeft className="mr-2 w-4 h-4" /> All Services
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
