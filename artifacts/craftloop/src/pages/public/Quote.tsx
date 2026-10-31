import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useListPublicServices, useCreateInquiry } from "@workspace/api-client-react";
import { ServiceCategory } from "@workspace/api-client-react/api.schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const badgeConfig: Record<string, { label: string; className: string }> = {
  HOT:        { label: "🔥 Hot",        className: "bg-red-500 text-white border-0" },
  NEW:        { label: "✨ New",        className: "bg-blue-500 text-white border-0" },
  POPULAR:    { label: "⭐ Popular",    className: "bg-amber-500 text-white border-0" },
  BEST_VALUE: { label: "💎 Best Value", className: "bg-purple-500 text-white border-0" },
};

const formSchema = z.object({
  name:           z.string().min(2, "Name is required"),
  email:          z.string().email("Valid email is required"),
  phone:          z.string().optional(),
  serviceNeeded:  z.nativeEnum(ServiceCategory).optional(),
  servicePlanId:  z.number().optional(),
  projectDetails: z.string().min(20, "Please provide some details about your project"),
  budgetRange:    z.string().optional(),
  timeline:       z.string().optional(),
});

export default function Quote() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialService = searchParams.get("service") as ServiceCategory | null;
  const initialPlanId  = searchParams.get("plan") ? Number(searchParams.get("plan")) : undefined;

  const { toast }         = useToast();
  const createInquiry     = useCreateInquiry();
  const { data: services } = useListPublicServices();
  const [submitted, setSubmitted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<z.infer<typeof formSchema>, any, z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name:           "",
      email:          "",
      phone:          "",
      serviceNeeded:  Object.values(ServiceCategory).includes(initialService as any) ? (initialService ?? undefined) : undefined,
      servicePlanId:  initialPlanId,
      projectDetails: "",
      budgetRange:    "",
      timeline:       "",
    },
  });

  const watchedService = form.watch("serviceNeeded");
  const selectedService = services?.find((s: any) => s.category === watchedService);
  const availablePlans  = (selectedService?.plans as any[] | undefined)?.filter((p: any) => p.isActive) ?? [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    createInquiry.mutate({ data: values }, {
      onSuccess: () => { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: (err.data as any)?.message || err.message || "Failed to submit request" });
      },
    });
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
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-4">Request Received</h1>
          <p className="text-[#8E8E9A] text-lg mb-10 leading-relaxed">
            Thank you for reaching out. Our team will review your project details and get back to you within 24 hours with a tailored proposal.
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

      {/* ══════════════════════════════════════════════
           HERO — Dark
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[44vh] flex items-center bg-[#06060A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-28 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-white/60 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Free, no-obligation quote
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-white leading-[1.05] mb-5"
          >
            Get a Quote
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#8E8E9A] text-lg max-w-md mx-auto leading-relaxed"
          >
            Tell us about your vision. We'll bring it to life.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
           FORM
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="bg-white border border-[#E8E8ED] shadow-xl rounded-3xl p-8 md:p-12"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

                <div className="grid md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Full Name *</FormLabel>
                      <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED] focus:border-blue-500 focus:ring-blue-500/20" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Email Address *</FormLabel>
                      <FormControl><Input type="email" className="h-12 rounded-xl border-[#E8E8ED] focus:border-blue-500 focus:ring-blue-500/20" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Phone Number (optional)</FormLabel>
                      <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED] focus:border-blue-500 focus:ring-blue-500/20" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="serviceNeeded" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Service Needed (optional)</FormLabel>
                      <Select
                        onValueChange={(v) => { field.onChange(v || undefined); form.setValue("servicePlanId", undefined); }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-[#E8E8ED]">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not sure yet — general inquiry</SelectItem>
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
                </div>

                {availablePlans.length > 0 && (
                  <FormField control={form.control} name="servicePlanId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Specific Plan (Optional)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? undefined : Number(v))}
                        value={field.value !== undefined ? String(field.value) : "none"}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-[#E8E8ED]">
                            <SelectValue placeholder="Not sure — general inquiry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not sure — general inquiry</SelectItem>
                          {availablePlans.map((plan: any) => {
                            const badge = plan.badge !== "NONE" ? badgeConfig[plan.badge] : null;
                            return (
                              <SelectItem key={plan.id} value={String(plan.id)}>
                                <div className="flex items-center gap-2">
                                  <span>{plan.name}</span>
                                  {badge && <Badge className={`text-xs px-1.5 py-0 h-4 ${badge.className}`}>{badge.label}</Badge>}
                                  {plan.startingPrice && <span className="text-[#6E6E73] text-xs">— {plan.startingPrice}</span>}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="projectDetails" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[#1D1D1F]">Project Details *</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[140px] rounded-xl border-[#E8E8ED] resize-y focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Describe your project, goals, and requirements..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="budgetRange" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Estimated Budget (Optional)</FormLabel>
                      <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" placeholder="e.g. $5,000 – $10,000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="timeline" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#1D1D1F]">Expected Timeline (Optional)</FormLabel>
                      <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" placeholder="e.g. 2–3 months" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <button
                  type="submit"
                  disabled={createInquiry.isPending}
                  className="w-full h-14 rounded-xl text-base font-bold bg-[#1D1D1F] text-white flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                >
                  {createInquiry.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Submit Quote Request <ArrowRight className="w-4 h-4" /></>
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
