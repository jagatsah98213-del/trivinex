import { useState } from "react";
import { useListPublicPortfolioItems } from "@workspace/api-client-react";
import type { ServiceCategory } from "@workspace/api-client-react/api.schemas";
import { Loader2, Play, ExternalLink, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link } from "wouter";

const categories: { label: string; value: ServiceCategory | "" }[] = [
  { label: "All Works",            value: "" },
  { label: "Web Development",      value: "WEB_DEVELOPMENT" },
  { label: "Video Editing",        value: "VIDEO_EDITING" },
  { label: "Photography",          value: "PHOTOGRAPHY" },
  { label: "Videography",          value: "VIDEOGRAPHY" },
  { label: "Graphic Design",       value: "GRAPHIC_DESIGN" },
  { label: "Script & Content",     value: "SCRIPT_CONTENT_WRITING" },
  { label: "SEO",                  value: "SEO" },
  { label: "Digital Marketing",    value: "DIGITAL_MARKETING" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as any },
};

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "">("");
  const { data: items, isLoading } = useListPublicPortfolioItems(
    activeCategory ? { category: activeCategory } : undefined
  );

  return (
    <div className="flex flex-col overflow-hidden">

      {/* HERO */}
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
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-28 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-white/60 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Selected Works
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6"
          >
            Our{" "}
            <span style={{ background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 60%, #F472B6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              finest work.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[#8E8E9A] text-lg max-w-xl mx-auto leading-relaxed"
          >
            A curated collection of projects we're proud of — spanning web, video, design, photography, and beyond.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* FILTER + GRID */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="container mx-auto px-4">
          {/* Filter pills with animated selection indicator */}
          <LayoutGroup>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-2.5 mb-14"
            >
              {categories.map((c) => (
                <motion.button
                  key={c.value}
                  onClick={() => setActiveCategory(c.value)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative inline-flex h-9 items-center rounded-full px-5 text-sm font-semibold transition-colors duration-200 ${
                    activeCategory === c.value
                      ? "text-white"
                      : "bg-white border border-[#D2D2D7] text-[#6E6E73] hover:border-[#1D1D1F] hover:text-[#1D1D1F]"
                  }`}
                >
                  {activeCategory === c.value && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-[#1D1D1F]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{c.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </LayoutGroup>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {items?.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05, duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ transition: "box-shadow 0.3s" }}
                    className="group overflow-hidden rounded-3xl bg-white border border-[#E8E8ED] shadow-sm hover:shadow-2xl"
                  >
                    {/* Media */}
                    <div className="aspect-video relative overflow-hidden bg-[#F5F5F7]">
                      {item.mediaType === "image" && (
                        <motion.img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.07 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      )}
                      {item.mediaType === "video" && (
                        <div className="w-full h-full relative">
                          <motion.img
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.07 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <motion.div
                              className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-[#06060A] backdrop-blur-sm shadow-xl"
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Play className="w-6 h-6 ml-1" />
                            </motion.div>
                          </div>
                        </div>
                      )}
                      {item.mediaType === "link" && (
                        <div className="w-full h-full relative">
                          {item.thumbnailUrl ? (
                            <motion.img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.07 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <ExternalLink className="w-10 h-10 text-blue-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => window.open(item.mediaUrl, "_blank")}
                              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#06060A] shadow-xl"
                            >
                              Visit <ExternalLink className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <div className="text-xs font-bold tracking-wider text-blue-600 mb-2 uppercase">
                        {item.serviceCategory.replace(/_/g, " ")}
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] mb-1.5">{item.title}</h3>
                      {item.description && (
                        <p className="text-[#6E6E73] text-sm line-clamp-2">{item.description}</p>
                      )}
                      {item.liveDemoUrl && (
                        <a
                          href={item.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {item.demoButtonLabel || "View live demo"} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items?.length === 0 && (
                <div className="col-span-full text-center py-20 text-[#6E6E73] text-lg">
                  No portfolio items found for this category.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#06060A] py-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full bg-blue-500 blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white mb-5 leading-[1.1]">
            Your project could be next.
          </motion.h2>
          <motion.p {...fadeUp} className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Let's create something you'll be proud to show off.
          </motion.p>
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-colors duration-200">
                Start a Project
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link href="/services" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 text-white px-8 text-sm font-semibold hover:bg-white/[0.06] transition-colors duration-200">
                Explore Services <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
