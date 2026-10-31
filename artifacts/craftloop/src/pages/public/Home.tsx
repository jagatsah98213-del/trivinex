import { useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { ArrowRight, Code, Video, Camera, Palette, PenTool, TrendingUp, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SEOHead, SITE_URL } from "@/components/SEOHead";
import { CountUp } from "@/components/ui/CountUp";

const HOME_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/`,
    "url": SITE_URL,
    "name": "Trivinex Partners — Everything You Need, All in One Place",
    "description": "One-stop digital services company offering web development, video editing, graphic designing, content writing, photography, videography, and SEO — delivered worldwide by one trusted team at honest prices.",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "about": { "@id": `${SITE_URL}/#organization` },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL }],
    },
  },
];

// Mouse-tracking 3D tilt hook for service cards
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 400, damping: 40 });
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

const services = [
  { icon: Code,       title: "Web Development",    slug: "web-development",          desc: "Business and corporate websites, portfolio sites, e-commerce, landing pages, custom web apps.", color: "from-blue-500 to-blue-600" },
  { icon: Video,      title: "Video Editing",       slug: "video-editing",            desc: "Wedding edits, YouTube content, Shorts/Reels/TikTok, business promos, cinematic videos.", color: "from-purple-500 to-purple-600" },
  { icon: Camera,     title: "Photography",         slug: "photography",              desc: "Business, product, restaurant, hotel, event, wedding, portrait photography.", color: "from-pink-500 to-rose-600" },
  { icon: Video,      title: "Videography",         slug: "videography",              desc: "Weddings, events, business promos, restaurant/hotel/product videos, interviews.", color: "from-indigo-500 to-indigo-600" },
  { icon: Palette,    title: "Graphic Design",      slug: "graphic-design",           desc: "Logo and brand identity, social graphics, posters, flyers, ads, thumbnails.", color: "from-orange-500 to-amber-600" },
  { icon: PenTool,    title: "Script & Content Writing", slug: "script-content-writing", desc: "YouTube scripts, ad scripts, website copy, social captions, storytelling.", color: "from-green-500 to-emerald-600" },
  { icon: TrendingUp, title: "SEO",                  slug: "seo",                      desc: "Website SEO, keyword research, on-page, technical, local SEO, audits.", color: "from-cyan-500 to-teal-600" },
  { icon: Zap,        title: "Digital Marketing",   slug: "digital-marketing",        desc: "Social-media marketing, campaign planning, digital ads, content strategy.", color: "from-amber-500 to-orange-600" },
];

function usePublicSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ["public-site-settings"],
    queryFn: () => fetch("/api/public/site-settings").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

// Stagger container variants
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as any as any } },
};

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as any }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      style={{ perspective: 1000 }}
    >
      <Link href={`/services/${service.slug}`}>
        <motion.div
          ref={ref}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative bg-white border border-[#E8E8ED] rounded-3xl p-8 cursor-pointer overflow-hidden h-full shadow-sm hover:shadow-2xl transition-shadow duration-500"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/40 rounded-3xl" />
          <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <service.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-3 tracking-tight">{service.title}</h3>
            <p className="text-[#6E6E73] leading-relaxed text-sm">{service.desc}</p>
            <div className="flex items-center gap-2 mt-6 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
              Learn more <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Floating dashboard card for hero
function HeroDashboardCard({ settings }: { settings: Record<string, string> }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-200, 200], [12, -12]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-200, 200], [-12, 12]), { stiffness: 200, damping: 30 });
  const ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const bars = [45, 65, 40, 80, 55, 90, 70, 85, 60, 95, 75, 88];
  const revenue = settings.hero_revenue || "$128k";
  const clients = settings.stat_1_value || "200+";

  return (
    <div
      ref={sectionRef}
      className="relative flex items-center justify-center"
      onMouseMove={(e) => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent blur-3xl scale-150" />
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[420px] sm:w-[420px]"
      >
        <div className="absolute inset-0 translate-y-8 scale-95 bg-blue-500/20 rounded-3xl blur-2xl" />
        <div className="relative bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-6 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <div className="flex-1 mx-4 h-5 bg-white/[0.06] rounded-full" />
          </div>
          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Revenue", val: revenue, change: "+8%", up: true },
              { label: "Clients",  val: clients, change: "+12", up: true },
              { label: "Rating",   val: "4.9/5", change: "★ Top", up: true },
            ].map((m) => (
              <div key={m.label} className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-3">
                <div className="text-[10px] text-white/40 mb-1 font-medium">{m.label}</div>
                <div className="text-base font-bold text-white">{m.val}</div>
                <div className="text-[10px] text-green-400 font-semibold mt-0.5">{m.change}</div>
              </div>
            ))}
          </div>
          {/* Bar chart */}
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/50 font-semibold">Deliverables</span>
              <span className="text-xs text-blue-400 font-bold">12-month trend</span>
            </div>
            <div className="flex items-end gap-1.5 h-14">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.6 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                >
                  <div
                    className="w-full h-full rounded-sm"
                    style={{
                      background: i >= 10
                        ? "linear-gradient(to top, #3B82F6, #60A5FA)"
                        : "rgba(255,255,255,0.12)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          {/* Team row */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500"].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#0A0A0F] flex items-center justify-center text-[9px] font-bold text-white`}>
                  {["JK", "AS", "MR", "TL"][i]}
                </div>
              ))}
            </div>
            <span className="text-xs text-white/40">Top-rated freelancers</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-semibold">Live</span>
            </div>
          </div>
        </div>

        {/* Floating badge 1 */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:flex absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2.5 shadow-2xl border border-[#E8E8ED] items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm">✓</div>
          <div>
            <div className="text-[11px] font-bold text-[#1D1D1F] leading-none">Project delivered</div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">2 minutes ago</div>
          </div>
        </motion.div>

        {/* Floating badge 2 */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="hidden sm:flex absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2.5 shadow-2xl border border-[#E8E8ED] items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm">★</div>
          <div>
            <div className="text-[11px] font-bold text-[#1D1D1F] leading-none">5-star review</div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">From happy client</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Animated stat item with counting number
function StatItem({ val, label, delay }: { val: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="text-5xl lg:text-6xl font-extrabold tracking-tighter text-white mb-3">
        <CountUp value={val} />
      </div>
      <div className="text-sm font-semibold text-white/40 uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any },
} as const;

// Trust bar items — appear one by one
const trustItems = [
  { icon: "★", label: "4.9/5 Rating" },
  { icon: "👥", label: "200+ Clients" },
  { icon: "🏆", label: "Top 1% Talent" },
  { icon: "⚡", label: "On-Time Delivery" },
];

export default function Home() {
  const { data: settings = {} } = usePublicSettings();

  const stats = [
    { val: settings.stat_1_value || "200+", label: settings.stat_1_label || "Clients Served" },
    { val: settings.stat_2_value || "98%",  label: settings.stat_2_label || "Satisfaction Rate" },
    { val: settings.stat_3_value || "5+",   label: settings.stat_3_label || "Years of Excellence" },
    { val: settings.stat_4_value || "Top 1%", label: settings.stat_4_label || "Talent Pool" },
  ];

  return (
    <div>
      <SEOHead
        title={undefined}
        description="Trivinex Partners is a one-stop digital services company offering web development, video editing, graphic designing, content writing, photography, videography, and SEO — delivered worldwide by one trusted team at honest prices."
        canonical="/"
        jsonLd={HOME_JSONLD}
      />

      {/* ═══════════════════════════════════════════════════════════
           HERO — Full-viewport dark with 3D dashboard card
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100svh-4rem)] lg:min-h-screen bg-[#06060A] flex items-center overflow-x-clip overflow-y-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600 blur-[100px]"
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="w-full container mx-auto px-4 py-12 sm:py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left — copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-1.5 text-sm text-white/70 mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                World-class creative studio
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6"
              >
                Build something
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  style={{
                    background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  extraordinary.
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/50 leading-relaxed max-w-lg mb-10 w-full"
              >
                Trivinex Partners is a premium creative agency delivering world-class web development, design, video, and marketing — powered by the top 1% of verified talent.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/quote"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-base font-bold shadow-2xl hover:bg-blue-50 transition-colors duration-200"
                  >
                    Start a Project
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/consultation"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 text-white px-8 text-base font-semibold hover:bg-white/[0.06] transition-colors duration-200"
                  >
                    Book a Free Call <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right — 3D floating dashboard card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] as any }}
            >
              <HeroDashboardCard settings={settings} />
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#F5F5F7] to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════════
           TRUST BAR — Staggered individual items
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10 bg-[#F5F5F7]">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-wrap justify-center gap-10 text-center"
          >
            {trustItems.map(({ icon, label }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 text-[#6E6E73] cursor-default"
              >
                <motion.span
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2, ease: "easeInOut" }}
                  className="text-lg"
                >
                  {icon}
                </motion.span>
                <span className="text-sm font-semibold">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           CRAFT — Editorial dark text block
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-6">
            The Trivinex Standard
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as any }}
            className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F] leading-[1.15] mb-8"
          >
            Every pixel, every frame,{" "}
            <span className="text-[#6E6E73]">every word — crafted to last.</span>
          </motion.h2>
          <motion.p {...fadeUp} className="text-xl text-[#6E6E73] leading-relaxed">
            We don't take shortcuts. We partner with our clients as their dedicated creative team, delivering work that builds brands, drives revenue, and stands the test of time.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           SERVICES — 3D tilt cards
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F5F5F7]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              What We Do
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F]"
            >
              Our Expertise
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => <ServiceCard key={i} service={s} index={i} />)}
          </div>
          <motion.div {...fadeUp} className="text-center mt-12">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link
                href="/services"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-7 text-sm font-semibold text-[#1D1D1F] hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
              >
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           STATS — Dark section with counting numbers
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#1D1D1F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-blue-600 blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {stats.map((s, i) => (
              <StatItem key={s.label} val={s.val} label={s.label} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           PROCESS — Light, animated steps with drawing connector line
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              The Process
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F]"
            >
              How We Work
            </motion.h2>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 relative">
            {/* Animated connector line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.4 }}
              />
            </div>

            {[
              { step: "01", title: "Discovery",  desc: "We map out your goals, requirements, and vision in a focused kick-off session." },
              { step: "02", title: "Execution",  desc: "Dedicated specialists craft your project with meticulous detail and weekly progress updates." },
              { step: "03", title: "Delivery",   desc: "Polished, production-ready assets delivered on time — with 30 days post-launch support." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.18, duration: 0.6 }}
                className="text-center"
              >
                <motion.div
                  whileInView={{ scale: [0.5, 1.15, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.18 + 0.2, duration: 0.5, ease: "easeOut" }}
                  className="w-20 h-20 rounded-full bg-white border-2 border-[#E8E8ED] shadow-lg text-blue-600 flex items-center justify-center text-2xl font-black mx-auto mb-8 relative z-10"
                >
                  {s.step}
                </motion.div>
                <h3 className="text-xl font-bold text-[#1D1D1F] mb-3">{s.title}</h3>
                <p className="text-[#6E6E73] leading-relaxed text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
           CTA — Premium dark gradient with spring buttons
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#06060A] py-32">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full bg-blue-500 blur-[100px]"
          />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white mb-6 leading-[1.1]"
          >
            Ready to build something{" "}
            <span style={{
              background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              extraordinary?
            </span>
          </motion.h2>
          <motion.p {...fadeUp} className="text-white/50 text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            Join {settings.stat_1_value || "200+"} businesses that trust Trivinex Partners to deliver world-class digital work.
          </motion.p>
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/quote"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-base font-bold shadow-2xl hover:bg-blue-50 transition-colors duration-200"
              >
                Start a Project
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/consultation"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 text-white px-8 text-base font-semibold hover:bg-white/[0.06] transition-colors duration-200"
              >
                Book a Free Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
