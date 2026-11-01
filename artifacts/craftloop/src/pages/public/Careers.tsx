import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServiceCategory, PayoutMethod } from "@workspace/api-client-react/api.schemas";
import { customFetch } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ArrowRight, Users, Star, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  serviceCategory: z.nativeEnum(ServiceCategory, { required_error: "Please select a specialty" }),
  portfolioLinks: z.string().min(5, "At least one portfolio link is required"),
  yearsExperience: z.coerce.number().min(0).max(50),
  equipmentOwned: z.string().optional(),
  availability: z.string().min(2, "Please indicate your availability"),
  expectedRate: z.string().min(2, "Please indicate your expected rate"),
  preferredPayout: z.nativeEnum(PayoutMethod, { required_error: "Please select a payout method" }),
  coverNote: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const perks = [
  { icon: Users, title: "Steady Projects", desc: "No more cold pitching. We funnel high-quality work to you." },
  { icon: Star, title: "Top-Tier Peers", desc: "Work alongside the best creatives and technicians in the world." },
  { icon: Zap, title: "On-Time Pay", desc: "Reliable, transparent payout via your preferred method." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any },
};

export default function Careers() {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", portfolioLinks: "",
      yearsExperience: 0, equipmentOwned: "", availability: "",
      expectedRate: "", coverNote: "", resumeUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const portfolioLinksArray = values.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean);
    setIsPending(true);
    try {
      await customFetch("/api/public/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          portfolioLinks: portfolioLinksArray,
          resumeUrl: values.resumeUrl || undefined,
        }),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to submit application" });
    } finally {
      setIsPending(false);
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#06060A] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-blue-500/15 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative z-10 text-center px-4 max-w-lg mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-4">Application Submitted</h1>
          <p className="text-[#8E8E9A] text-lg mb-10 leading-relaxed">
            Thank you for applying. We review portfolios carefully and will reach out if your work aligns with our current needs.
          </p>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ════════════════════════════════════════════════════
           HERO — Dark
      ════════════════════════════════════════════════════ */}
      <section className="relative min-h-[60vh] flex items-center bg-[#06060A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-28 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-white/60 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Join Our Talent Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6"
          >
            Stop hunting.{" "}
            <span style={{ background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 60%, #F472B6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Start creating.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[#8E8E9A] text-lg max-w-xl mx-auto leading-relaxed"
          >
            We partner with skilled professionals across eight service divisions. Get a steady stream of quality projects — no pitching, no chasing clients.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* ════════════════════════════════════════════════════
           PERKS — Light gray
      ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {perks.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white border border-[#E8E8ED] rounded-3xl p-7 shadow-sm"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-[#1D1D1F] mb-2">{title}</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Application form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any }}
            className="bg-white border border-[#E8E8ED] shadow-xl rounded-3xl p-8 md:p-12"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1D1D1F] mb-8">Apply to Join Our Network</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Personal */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6E6E73] mb-5 pb-2 border-b border-[#E8E8ED]">
                    Personal Information
                  </p>
                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Full Name *</FormLabel>
                        <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Email Address *</FormLabel>
                        <FormControl><Input type="email" className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Phone Number *</FormLabel>
                        <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Professional */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6E6E73] mb-5 pb-2 border-b border-[#E8E8ED]">
                    Professional Details
                  </p>
                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <FormField control={form.control} name="serviceCategory" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Primary Specialty *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-[#E8E8ED]"><SelectValue placeholder="Select specialty" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem>
                            <SelectItem value="VIDEO_EDITING">Video Editing</SelectItem>
                            <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
                            <SelectItem value="VIDEOGRAPHY">Videography</SelectItem>
                            <SelectItem value="GRAPHIC_DESIGN">Graphic Design</SelectItem>
                            <SelectItem value="SCRIPT_CONTENT_WRITING">Script & Content Writing</SelectItem>
                            <SelectItem value="SEO">SEO</SelectItem>
                            <SelectItem value="DIGITAL_MARKETING">Digital Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Years of Experience *</FormLabel>
                        <FormControl><Input type="number" className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="portfolioLinks" render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-semibold text-[#1D1D1F]">Portfolio Links * (comma-separated)</FormLabel>
                      <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" placeholder="https://dribbble.com/..., https://github.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="resumeUrl" render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-semibold text-[#1D1D1F]">Resume / CV URL (Optional)</FormLabel>
                      <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" placeholder="Google Drive, Dropbox, etc." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="equipmentOwned" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Equipment & Software Owned</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[80px] rounded-xl border-[#E8E8ED] resize-y" placeholder="e.g. MacBook Pro M3, Sony A7IV, Adobe CC..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Logistics */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6E6E73] mb-5 pb-2 border-b border-[#E8E8ED]">
                    Logistics
                  </p>
                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <FormField control={form.control} name="availability" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Availability *</FormLabel>
                        <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" placeholder="e.g. 20 hrs/week, full-time" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="expectedRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#1D1D1F]">Expected Rate *</FormLabel>
                        <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" placeholder="e.g. $150/logo, $45/hr" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="preferredPayout" render={({ field }) => (
                    <FormItem className="mb-5 max-w-sm">
                      <FormLabel className="font-semibold text-[#1D1D1F]">Preferred Payout Method *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-[#E8E8ED]"><SelectValue placeholder="Select method" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="PHONEPE">PhonePe</SelectItem>
                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                          <SelectItem value="ESEWA">eSewa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="coverNote" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Cover Note (Optional)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[100px] rounded-xl border-[#E8E8ED] resize-y" placeholder="Anything else we should know?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-14 rounded-xl text-base font-bold bg-[#1D1D1F] text-white flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Submit Application <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
