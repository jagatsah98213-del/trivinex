import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useListPublicMeetingSlots, useCreateMeetingBooking } from "@workspace/api-client-react";
import { format, isSameDay, parseISO } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle2, ArrowRight, ChevronRight, Mail, Phone, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

function usePublicSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ["public-site-settings"],
    queryFn: () => fetch("/api/public/site-settings").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

const formSchema = z.object({
  slotId:      z.number({ required_error: "Please select a time slot" }),
  clientName:  z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().min(5, "Phone number is required"),
  notes:       z.string().optional(),
});

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] as any },
};

export default function Consultation() {
  const { data: allSlots, isLoading: loadingSlots } = useListPublicMeetingSlots();
  const createBooking = useCreateMeetingBooking();
  const { toast }     = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { data: settings = {} } = usePublicSettings();
  const contactEmail    = settings.contact_email    || "";
  const contactPhone    = settings.contact_phone    || "";
  const contactWhatsapp = settings.contact_whatsapp || "";

  // Step state: "date" → "time" → "details"
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { clientName: "", clientEmail: "", clientPhone: "", notes: "" },
  });

  const selectedSlotId = form.watch("slotId");
  const selectedSlot   = allSlots?.find((s: any) => s.id === selectedSlotId);

  // Compute which calendar days have available slots
  const availableDates = useMemo(() => {
    if (!allSlots) return new Set<string>();
    return new Set(allSlots.map((s: any) => format(parseISO(s.date as string), "yyyy-MM-dd")));
  }, [allSlots]);

  // Slots for the selected date
  const slotsForDate = useMemo(() => {
    if (!selectedDate || !allSlots) return [];
    return allSlots.filter((s: any) => isSameDay(parseISO(s.date), selectedDate));
  }, [allSlots, selectedDate]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    createBooking.mutate({ data: values }, {
      onSuccess: () => { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); },
      onError:  (err) => {
        toast({ variant: "destructive", title: "Booking failed", description: (err.data as any)?.message || err.message || "Could not complete booking" });
      },
    });
  }

  // ── Success state ────────────────────────────────────────────────────────────
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
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-4">Consultation Booked</h1>
          <p className="text-[#8E8E9A] text-lg mb-8 leading-relaxed">
            Your free consultation has been scheduled. A calendar invite and meeting link have been sent to your email.
          </p>
          {selectedSlot && (
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-5 mb-8 text-left inline-block">
              <div className="text-white font-bold mb-3">Meeting Details</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#8E8E9A] text-sm">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  {format(parseISO((selectedSlot as any).date), "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-[#8E8E9A] text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {(selectedSlot as any).startTime}
                </div>
              </div>
            </div>
          )}
          <br />
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[#06060A] px-8 text-sm font-bold shadow-2xl hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5">
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[44vh] flex items-center bg-[#06060A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-28 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            100% Free · No commitment
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-white leading-[1.05] mb-5"
          >
            Book a Free Consultation
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#8E8E9A] text-lg max-w-md mx-auto leading-relaxed">
            Schedule a 30-minute discovery call to discuss your needs and see how we can help.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* ── Booking flow ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="container mx-auto px-4 max-w-5xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-[1fr_360px] gap-8">

              {/* ── Left column ────────────────────────────────────────────── */}
              <div className="space-y-6">

                {/* ── Step 1 — Pick a Date ───────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="bg-white border border-[#E8E8ED] shadow-sm rounded-3xl p-8">

                  {/* Step header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${selectedDate ? "bg-blue-600 text-white" : "bg-[#1D1D1F] text-white"}`}>
                      {selectedDate ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Choose a Date</h2>
                    {selectedDate && (
                      <span className="ml-auto text-sm font-semibold text-blue-600">
                        {format(selectedDate, "EEE, MMM d")}
                      </span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                  ) : availableDates.size === 0 ? (
                    <div className="p-6 text-center bg-[#F5F5F7] rounded-2xl text-[#6E6E73]">
                      No available slots at the moment. Please check back later.
                    </div>
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        // Clear any previously selected slot when date changes
                        form.setValue("slotId", undefined as any);
                      }}
                      disabled={(date) => {
                        // Disable past dates and dates with no slots
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return true;
                        const dateStr = format(date, "yyyy-MM-dd");
                        return !availableDates.has(dateStr);
                      }}
                      modifiers={{ available: (date) => availableDates.has(format(date, "yyyy-MM-dd")) }}
                      modifiersClassNames={{ available: "font-bold" }}
                      className="rounded-2xl border-0 p-0"
                      classNames={{
                        months: "flex flex-col",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center mb-2",
                        caption_label: "text-base font-bold text-[#1D1D1F]",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-8 w-8 bg-transparent hover:bg-[#F5F5F7] rounded-full flex items-center justify-center transition-colors",
                        nav_button_previous: "absolute left-0",
                        nav_button_next: "absolute right-0",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell: "text-[#6E6E73] rounded-md w-10 font-semibold text-xs flex-1 text-center",
                        row: "flex w-full mt-2",
                        cell: "flex-1 text-center text-sm relative focus-within:relative focus-within:z-20",
                        day: "h-10 w-10 mx-auto p-0 font-medium rounded-full transition-colors hover:bg-blue-50 hover:text-blue-600 aria-selected:opacity-100",
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                        day_today: "bg-[#F5F5F7] font-bold text-[#1D1D1F]",
                        day_outside: "text-[#C7C7CC] aria-selected:bg-blue-100 aria-selected:text-blue-600",
                        day_disabled: "text-[#C7C7CC] opacity-40 cursor-not-allowed hover:bg-transparent hover:text-[#C7C7CC]",
                      }}
                    />
                  )}
                </motion.div>

                {/* ── Step 2 — Pick a Time (only shown after date selected) ─ */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div key="time-step" {...fadeUp}
                      className="bg-white border border-[#E8E8ED] shadow-sm rounded-3xl p-8">

                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${selectedSlotId ? "bg-blue-600 text-white" : "bg-[#1D1D1F] text-white"}`}>
                          {selectedSlotId ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                          Available Times — <span className="text-blue-600">{format(selectedDate, "EEEE, MMMM d")}</span>
                        </h2>
                      </div>

                      {slotsForDate.length === 0 ? (
                        <div className="p-6 text-center bg-[#F5F5F7] rounded-2xl text-[#6E6E73]">
                          No available slots on this date. Please pick a different day.
                        </div>
                      ) : (
                        <FormField control={form.control} name="slotId" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {slotsForDate.map((slot: any) => {
                                  const isSelected = field.value === slot.id;
                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      onClick={() => field.onChange(slot.id)}
                                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-left ${
                                        isSelected
                                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                                          : "border-[#E8E8ED] bg-white hover:border-blue-200 hover:bg-blue-50/40"
                                      }`}
                                    >
                                      <Clock className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-500" : "text-[#6E6E73]"}`} />
                                      <span className={`font-bold tabular-nums ${isSelected ? "text-blue-700" : "text-[#1D1D1F]"}`}>
                                        {slot.startTime}
                                      </span>
                                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500 ml-auto shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Step 3 — Your Details (only shown after slot selected) ─ */}
                <AnimatePresence>
                  {selectedSlotId && (
                    <motion.div key="details-step" {...fadeUp}
                      className="bg-white border border-[#E8E8ED] shadow-sm rounded-3xl p-8">

                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center text-sm font-extrabold shrink-0">3</div>
                        <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Your Details</h2>
                      </div>

                      <div className="space-y-5">
                        <FormField control={form.control} name="clientName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-[#1D1D1F]">Full Name *</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid md:grid-cols-2 gap-5">
                          <FormField control={form.control} name="clientEmail" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-[#1D1D1F]">Email Address *</FormLabel>
                              <FormControl><Input type="email" className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="clientPhone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-[#1D1D1F]">Phone Number *</FormLabel>
                              <FormControl><Input className="h-12 rounded-xl border-[#E8E8ED]" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-[#1D1D1F]">What would you like to discuss? <span className="text-[#6E6E73] font-normal">(Optional)</span></FormLabel>
                            <FormControl>
                              <Textarea className="min-h-[100px] rounded-xl border-[#E8E8ED] resize-y" placeholder="Briefly describe what you're looking for..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Right: Summary sidebar ──────────────────────────────────── */}
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                  className="bg-white border border-[#E8E8ED] rounded-3xl p-8 sticky top-28 shadow-xl">

                  <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] mb-6">Summary</h3>

                  <div className="space-y-0 mb-8">
                    {[
                      { label: "Service",  val: "Strategy Call" },
                      { label: "Duration", val: "30 Minutes" },
                      { label: "Cost",     val: "Free" },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between items-center py-3 border-b border-[#F5F5F7]">
                        <span className="text-[#6E6E73] text-sm font-medium">{label}</span>
                        <span className={`font-bold text-sm ${val === "Free" ? "text-green-600" : "text-[#1D1D1F]"}`}>{val}</span>
                      </div>
                    ))}

                    <AnimatePresence>
                      {selectedDate && (
                        <motion.div key="date-row" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden">
                          <div className="flex justify-between items-start py-3 border-b border-[#F5F5F7]">
                            <span className="text-[#6E6E73] text-sm font-medium">Date</span>
                            <span className="font-bold text-sm text-[#1D1D1F] text-right">
                              {format(selectedDate, "EEE, MMM d, yyyy")}
                            </span>
                          </div>
                        </motion.div>
                      )}
                      {selectedSlot && (
                        <motion.div key="time-row" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden">
                          <div className="flex justify-between items-center py-3 border-b border-[#F5F5F7]">
                            <span className="text-[#6E6E73] text-sm font-medium">Time</span>
                            <span className="font-bold text-sm text-blue-600">{(selectedSlot as any).startTime}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress indicator */}
                  <div className="mb-6 space-y-2">
                    {[
                      { label: "Select date",  done: !!selectedDate },
                      { label: "Select time",  done: !!selectedSlotId },
                      { label: "Your details", done: false },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${step.done ? "bg-blue-600" : "bg-[#E8E8ED]"}`}>
                          {step.done
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            : <span className="text-[10px] font-bold text-[#8E8E9A]">{i + 1}</span>}
                        </div>
                        <span className={`text-sm font-medium ${step.done ? "text-[#1D1D1F] line-through opacity-50" : "text-[#6E6E73]"}`}>{step.label}</span>
                        {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-[#C7C7CC] ml-auto" />}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={createBooking.isPending || !selectedSlotId}
                    className="w-full h-14 rounded-xl text-base font-bold bg-[#1D1D1F] text-white flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                  >
                    {createBooking.isPending
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <><ArrowRight className="w-4 h-4" /> Confirm Booking</>}
                  </button>

                  {!selectedDate && (
                    <p className="text-xs text-center text-[#8E8E9A] mt-3">Pick a date above to get started</p>
                  )}
                  {selectedDate && !selectedSlotId && (
                    <p className="text-xs text-center text-[#8E8E9A] mt-3">Now select an available time</p>
                  )}
                </motion.div>
              </div>

            </form>
          </Form>
        </div>
      </section>

      {/* ── Direct Contact Buttons ───────────────────────────────────────────── */}
      {(contactEmail || contactPhone || contactWhatsapp) && (
        <section className="bg-white border-t border-[#E8E8ED] py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center text-sm font-semibold text-[#6E6E73] uppercase tracking-widest mb-6"
            >
              Or reach us directly
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="group flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-[#E8E8ED] bg-white hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 min-w-[220px] justify-center sm:justify-start"
                >
                  <span className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0 transition-colors">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E6E73] group-hover:text-blue-500 transition-colors">Email Us</p>
                    <p className="text-sm font-semibold text-[#1D1D1F] group-hover:text-blue-700 transition-colors break-all">{contactEmail}</p>
                  </div>
                </a>
              )}
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/\s/g, "")}`}
                  className="group flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-[#E8E8ED] bg-white hover:border-[#1D1D1F] hover:bg-[#F5F5F7] transition-all duration-200 min-w-[220px] justify-center sm:justify-start"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#F5F5F7] group-hover:bg-[#E8E8ED] flex items-center justify-center shrink-0 transition-colors">
                    <Phone className="w-5 h-5 text-[#1D1D1F]" />
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E6E73] transition-colors">Call Us</p>
                    <p className="text-sm font-semibold text-[#1D1D1F] transition-colors">{contactPhone}</p>
                  </div>
                </a>
              )}
              {contactWhatsapp && (
                <a
                  href={`https://wa.me/${contactWhatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-[#E8E8ED] bg-white hover:border-green-500 hover:bg-green-50 transition-all duration-200 min-w-[220px] justify-center sm:justify-start"
                >
                  <span className="w-10 h-10 rounded-xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center shrink-0 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E6E73] group-hover:text-green-600 transition-colors">WhatsApp</p>
                    <p className="text-sm font-semibold text-[#1D1D1F] group-hover:text-green-700 transition-colors">Chat with us</p>
                  </div>
                </a>
              )}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
