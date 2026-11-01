import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MessageCircle, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { AiAssistant } from "@/components/AiAssistant";

function usePublicSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ["public-site-settings"],
    queryFn: () => fetch("https://trivinex.onrender.com/api/public/site-settings").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { data: settings = {} } = usePublicSettings();

  const phone = settings.contact_phone || "";
  const email = settings.contact_email || "";
  const whatsapp = settings.contact_whatsapp || "";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Track scroll for nav glass + back-to-top visibility
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/consultation", label: "Consultation" },
    { href: "/careers", label: "Join as Freelancer" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* ─── Nav ─── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-black/[0.08] shadow-sm shadow-black/[0.04]"
            : "border-b border-white/[0.12]"
        }`}
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.72)"
            : "rgba(255,255,255,0.18)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tighter flex items-center gap-0.5 shrink-0">
            <span className="text-[#1D1D1F]">TRIVINEX</span>
            <span className="text-blue-600"> PARTNERS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location === href
                    ? "text-[#1D1D1F]"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/terms"
              className="text-sm font-medium transition-colors duration-200 text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              Terms
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/quote"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#1D1D1F] px-4 lg:px-5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors duration-200"
            >
              Get a Quote
            </Link>
            <button
              className="md:hidden p-2 rounded-xl hover:bg-black/5 text-[#1D1D1F] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="md:hidden border-t border-white/10 bg-white/80 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm font-medium py-3 px-3 rounded-xl transition-colors ${
                      location === href
                        ? "text-[#1D1D1F] bg-[#F5F5F7]"
                        : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/terms"
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-3 px-3 rounded-xl transition-colors text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]`}
                >
                  Terms
                </Link>
                <div className="pt-2 mt-2 border-t border-[#E8E8ED]">
                  <Link
                    href="/quote"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center h-11 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      {/* ─── Scroll to top ─── */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-black/10 border border-black/[0.08]"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            <ArrowUp className="w-4 h-4 text-[#1D1D1F]" />
          </motion.button>
        )}
      </AnimatePresence>

      <ScrollProgress />

      {/* ─── Footer ─── */}
      <footer className="bg-[#F5F5F7] border-t border-[#E8E8ED] py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="font-extrabold text-xl tracking-tighter block mb-3">
                <span className="text-[#1D1D1F]">TRIVINEX</span>
                <span className="text-blue-600"> PARTNERS</span>
              </span>
              <p className="text-sm text-[#6E6E73] max-w-xs leading-relaxed">
                Founder-led digital services company. Web development, video editing, graphic design,
                photography, videography, script & content writing, SEO, and digital marketing — one
                managed relationship, worldwide.
              </p>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-4">Services</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Web Development", slug: "web-development" },
                  { label: "Video Editing", slug: "video-editing" },
                  { label: "Graphic Design", slug: "graphic-design" },
                  { label: "Photography", slug: "photography" },
                  { label: "Videography", slug: "videography" },
                  { label: "Script & Content Writing", slug: "script-content-writing" },
                  { label: "SEO", slug: "seo" },
                  { label: "Digital Marketing", slug: "digital-marketing" },
                ].map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-4">Company</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/about" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                  About Us
                </Link>
                <Link href="/portfolio" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                  Portfolio
                </Link>
                <Link href="/testimonials" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                  Testimonials
                </Link>
                <Link href="/terms" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                  Service Terms
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-4">Contact Us</p>
              <div className="flex flex-col gap-3">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 text-sm text-[#6E6E73] hover:text-blue-600 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#E8E8ED] group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <span className="break-all">{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2.5 text-sm text-[#6E6E73] hover:text-blue-600 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#E8E8ED] group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    {phone}
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-[#6E6E73] hover:text-green-600 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#E8E8ED] group-hover:bg-green-100 flex items-center justify-center transition-colors shrink-0">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </span>
                    WhatsApp
                  </a>
                )}
                {!email && !phone && !whatsapp && (
                  <Link href="/consultation" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                    Book a free consultation →
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E8E8ED] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6E6E73] text-center sm:text-left">
              &copy; {new Date().getFullYear()} Trivinex Partners. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                Service Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <AiAssistant pageContext={location} />
    </div>
  );
}
