import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Globe, Code2, Film, PenLine, Camera, Palette,
  TrendingUp, ShieldCheck, Users,
} from "lucide-react";
import { SEOHead, SITE_URL } from "@/components/SEOHead";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any },
};
const fadeUpDelay = (d: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay: d },
});

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as any } },
};

const SERVICES = [
  { icon: Code2, title: "Web Development", desc: "Business and corporate websites, portfolio sites, e-commerce, landing pages, custom web apps, redesign and maintenance." },
  { icon: Film, title: "Video Editing", desc: "Wedding edits, YouTube content, Shorts/Reels/TikTok, business promos, cinematic and corporate videos." },
  { icon: PenLine, title: "Script & Content Writing", desc: "YouTube scripts, ad scripts, website copy, social captions, educational content, storytelling." },
  { icon: Camera, title: "Photography", desc: "Business, product, restaurant, hotel, event, wedding, portrait, and social-media photography." },
  { icon: Palette, title: "Videography", desc: "Weddings, events, business promos, restaurant/hotel/product videos, interviews, music videos." },
  { icon: TrendingUp, title: "SEO", desc: "Website SEO, keyword research, on-page, technical, local SEO, Google Business Profile, audits, ongoing management." },
  { icon: ShieldCheck, title: "Graphic Design", desc: "Logo and brand identity, social graphics, posters, flyers, business cards, ads, thumbnails, presentation graphics." },
  { icon: Users, title: "Digital Marketing", desc: "Social-media marketing, campaign planning, digital ads, content strategy, audience development." },
];

const ABOUT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about`,
  "url": `${SITE_URL}/about`,
  "name": "About Trivenix Partners",
  "description": "Trivenix Partners is a founder-led, fully online digital services company that helps businesses access multiple digital and creative services through one managed company relationship.",
  "isPartOf": { "@id": `${SITE_URL}/#website` },
  "about": { "@id": `${SITE_URL}/#organization` },
};

export default function About() {
  return (
    <div className="flex flex-col overflow-hidden">
      <SEOHead
        title="About Trivenix Partners"
        description="Trivenix Partners is a founder-led, fully online digital services company that helps businesses access multiple digital and creative services through one managed company relationship."
        canonical="/about"
        jsonLd={ABOUT_JSONLD}
      />

      {/* ═══════════════════════════════════════════════
           HERO — Dark
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[65vh] flex items-center bg-[#06060A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.16, 0.1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.14, 0.1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-600 blur-[120px]"
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-28 pb-24 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-white/60 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Founder-Led · Fully Online
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] as any }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6"
          >
            One Network. Many Skills.{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              style={{
                background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 60%, #F472B6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One Digital Partner.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[#8E8E9A] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Trivenix Partners helps businesses access web development, video editing,
            graphic design, photography, videography, script & content writing, SEO, and
            digital marketing — through one managed company relationship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-colors duration-200">
                Request a Quote
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/consultation" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 text-white px-8 text-sm font-semibold hover:bg-white/[0.06] transition-colors duration-200">
                Book a Free Consultation <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════
           WHY WE EXIST — White
      ═══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-6">
            Why Trivenix Partners Exists
          </motion.p>
          <motion.h2 {...fadeUpDelay(0.1)} className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F] leading-[1.1] mb-8">
            Bridging two needs — with one managed relationship.
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-6 text-[#6E6E73] text-lg leading-relaxed"
          >
            {[
              "Businesses want reliable, affordable digital services but often struggle to coordinate multiple providers. Skilled professionals have capabilities but may struggle to find consistent project opportunities.",
              "Trivenix Partners was created to bridge that gap — connecting business needs with skilled professionals through one managed company.",
              "You hire Trivenix Partners, not an individual freelancer. We manage client communication, requirements, quotations, coordination, quality control, revisions, and delivery.",
            ].map((text, i) => (
              <motion.p
                key={i}
                variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as any } } }}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           SERVICES — Light gray
      ════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F5F5F7]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">Eight Service Divisions</motion.p>
            <motion.h2 {...fadeUpDelay(0.1)} className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F]">One partner, multiple solutions.</motion.h2>
            <motion.p {...fadeUpDelay(0.15)} className="text-[#6E6E73] text-lg mt-4 max-w-xl mx-auto">We never merge SEO with digital marketing, or photography with videography. Each division is managed independently.</motion.p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {SERVICES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={cardVariant}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="bg-white border border-[#E8E8ED] rounded-3xl p-8 shadow-sm hover:shadow-2xl"
              >
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-white border border-[#E8E8ED] flex items-center justify-center mb-5"
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Icon className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#1D1D1F] mb-3 tracking-tight">{title}</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           HOW IT WORKS — White
      ════════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">Our Process</motion.p>
            <motion.h2 {...fadeUpDelay(0.1)} className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F]">How we work with you.</motion.h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-12"
          >
            {[
              { step: "1", title: "Contact us", desc: "Reach out through the website or our official contact channels." },
              { step: "2", title: "Discuss needs", desc: "We discuss your goals, service, timeline, budget, and technical requirements." },
              { step: "3", title: "Get a quote", desc: "We recommend a service or plan and provide a quotation based on your actual project." },
              { step: "4", title: "Agree terms", desc: "We agree on scope, price, timeline, and terms in a written agreement." },
              { step: "5", title: "Production", desc: "Work is completed remotely by a suitable professional from our network." },
              { step: "6", title: "Quality review", desc: "Trivenix reviews the work before delivery to you." },
              { step: "7", title: "Revisions", desc: "We coordinate reasonable revisions within the agreed scope." },
              { step: "8", title: "Delivery", desc: "Approved work is delivered and the project is closed." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={cardVariant}
                whileHover={{ y: -6 }}
                className="flex gap-4 items-start p-6 rounded-2xl border border-[#E8E8ED] bg-white hover:shadow-xl transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-[#1D1D1F] mb-1">{item.title}</h3>
                  <p className="text-[#6E6E73] text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           WHO WE SERVE — Light gray
      ════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F5F5F7]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">Who We Serve</motion.p>
            <motion.h2 {...fadeUpDelay(0.1)} className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-[#1D1D1F]">Built for real businesses and creators.</motion.h2>
          </div>
          <motion.div {...fadeUpDelay(0.15)} className="space-y-4 text-[#6E6E73] text-lg leading-relaxed">
            <p>We serve small and medium businesses, startups, larger companies, restaurants, hotels, doctors and clinics, educational institutions, influencers, YouTubers, musicians, artists, wedding clients, individual professionals, NGOs, organizations, and international businesses.</p>
            <p>A core strength is that one client can combine several services through one managed relationship — for example, a restaurant may request a website plus photography, video, graphic design, SEO, and digital marketing.</p>
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════
           FOUNDER-LED MODEL — Dark
      ═════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#06060A] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-6">Our Model</motion.p>
          <motion.h2 {...fadeUpDelay(0.1)} className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-white leading-[1.1] mb-8">Founder-led. Fully remote.</motion.h2>
          <motion.div {...fadeUpDelay(0.15)} className="space-y-6 text-white/70 text-lg leading-relaxed">
            <p>Trivenix Partners is founder-led and fully online. We have no permanent physical office required for current operations. Our growing distributed professional network can currently include Nepal and India, with worldwide service ambition.</p>
            <p>The client relationship belongs to Trivenix Partners. The professional works remotely and submits work to the company. Management reviews work before final delivery — you never need to negotiate directly with the assigned professional.</p>
          </motion.div>

          <motion.div {...fadeUpDelay(0.25)} className="pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Our Vision (Future Aspiration)</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
              We aspire to grow into a formally registered company with physical corporate operations,
              a large distributed professional network, thousands of business clients, and advanced
              project-management technology. These are future ambitions — not current facts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════
           CTA — Dark
      ═════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#06060A] py-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full bg-blue-500 blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 max-w-2xl">
          <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">Ready to Start?</motion.p>
          <motion.h2 {...fadeUpDelay(0.1)} className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white mb-5 leading-[1.1]">
            One Digital Partner for Your Entire Online Presence
          </motion.h2>
          <motion.p {...fadeUpDelay(0.15)} className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Request a quote today and we’ll recommend the right service or plan for your project.
          </motion.p>
          <motion.div {...fadeUpDelay(0.2)} className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-colors duration-200">
                Request a Quote
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
