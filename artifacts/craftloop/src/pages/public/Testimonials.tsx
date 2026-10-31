import { useListPublicTestimonials } from "@workspace/api-client-react";
import type { Testimonial } from "@workspace/api-client-react";
import { Loader2, Star, Quote, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useEffect } from "react";
import { SEOHead, SITE_URL } from "@/components/SEOHead";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as any } },
};

// ─── Build Google-compatible Review JSON-LD ───────────────────────────────────
function buildReviewSchema(testimonials: Testimonial[]) {
  if (!testimonials.length) return null;
  const rated = testimonials.filter((t) => t.rating != null);
  const totalRating = rated.reduce((sum, t) => sum + (t.rating ?? 0), 0);
  const avgRating = rated.length ? (totalRating / rated.length).toFixed(1) : "0";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    "name": "Trivinex Partners",
    "url": SITE_URL,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": testimonials.length,
      "bestRating": "5",
      "worstRating": "1",
    },
    "review": testimonials.slice(0, 10).map((t) => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": t.clientName ?? "A client" },
      "reviewRating": { "@type": "Rating", "ratingValue": String(t.rating ?? 5), "bestRating": "5", "worstRating": "1" },
      "reviewBody": t.quote,
      "publisher": { "@type": "Organization", "name": "Trivinex Partners" },
    })),
  };
}

export default function Testimonials() {
  const { data: testimonials, isLoading } = useListPublicTestimonials();
  const published = testimonials?.filter((t) => t.isPublished !== false) ?? [];

  useEffect(() => {
    if (!published.length) return;
    const schema = buildReviewSchema(published);
    if (!schema) return;
    const id = "reviews-jsonld";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
    return () => { document.getElementById(id)?.remove(); };
  }, [JSON.stringify(published)]);

  const totalRating = published.reduce((s, t) => s + (t.rating ?? 0), 0);
  const ratedCount = published.filter((t) => t.rating != null).length;
  const avgRating = ratedCount ? (totalRating / ratedCount).toFixed(1) : "4.9";

  return (
    <div className="flex flex-col overflow-hidden">
      <SEOHead
        title="Client Reviews — Real Results, Real People"
        description={`Read what our clients say about Trivinex Partners. ${published.length > 0 ? `Rated ${avgRating}/5 from ${published.length} verified client reviews.` : "Rated 4.9/5 by businesses worldwide."} Web development, video editing, SEO, and more.`}
        canonical="/testimonials"
      />

      {/* ══════════════════════════════════════════════
           HERO — Dark
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center bg-[#06060A] overflow-hidden">
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
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-28 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-white/60 mb-8"
          >
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {avgRating} / 5.0 Average Rating
            {published.length > 0 && (
              <span className="text-white/40">· {published.length} reviews</span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] as any }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6"
          >
            Real results.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 60%, #F472B6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Real people.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[#8E8E9A] text-lg max-w-xl mx-auto leading-relaxed"
          >
            Don't take our word for it. Hear directly from the businesses and creators who trust Trivinex Partners to deliver world-class digital work.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
           REVIEWS GRID
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              <AnimatePresence>
                {published.map((t) => (
                  <motion.div
                    key={t.id}
                    variants={cardVariant}
                    whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(0,0,0,0.10)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="relative bg-white border border-[#E8E8ED] rounded-3xl p-8 shadow-sm cursor-default"
                    itemScope
                    itemType="https://schema.org/Review"
                    itemProp="itemListElement"
                  >
                    {/* Animated quote icon */}
                    <motion.div
                      className="absolute top-7 right-7"
                      whileHover={{ rotate: 15, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Quote className="w-8 h-8 text-blue-100" />
                    </motion.div>

                    {/* Stars */}
                    <div
                      className="flex gap-1 mb-6"
                      itemScope
                      itemType="https://schema.org/Rating"
                      itemProp="reviewRating"
                    >
                      <meta itemProp="ratingValue" content={String(t.rating)} />
                      <meta itemProp="bestRating"  content="5" />
                      <meta itemProp="worstRating" content="1" />
                      {Array.from({ length: 5 }).map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.06, type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              j < (t.rating ?? 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-[#E8E8ED] text-[#E8E8ED]"
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Quote text */}
                    <p
                      className="text-[#1D1D1F] text-base leading-relaxed mb-7 font-medium"
                      itemProp="reviewBody"
                    >
                      "{t.quote}"
                    </p>

                    {/* Author */}
                    <div
                      className="flex items-center gap-3 pt-5 border-t border-[#E8E8ED]"
                      itemScope
                      itemType="https://schema.org/Person"
                      itemProp="author"
                    >
                      <motion.div
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        {(t.clientName ?? "A").charAt(0).toUpperCase()}
                      </motion.div>
                      <div className="font-bold text-[#1D1D1F] text-sm" itemProp="name">
                        {t.clientName}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {published.length === 0 && (
                <div className="col-span-full text-center py-20 text-[#6E6E73] text-lg">
                  More client testimonials coming soon.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           CTA — Dark
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#06060A] py-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full bg-blue-500 blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            {...fadeUp}
            className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white mb-5 leading-[1.1]"
          >
            Ready to be next?
          </motion.h2>
          <motion.p {...fadeUp} className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Join 200+ businesses that trust Trivinex Partners to deliver world-class digital work.
          </motion.p>
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/quote"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-colors duration-200"
              >
                Start a Project
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/consultation"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 text-white px-8 text-sm font-semibold hover:bg-white/[0.06] transition-colors duration-200"
              >
                Book a Free Call <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
