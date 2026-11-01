import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListAdminMeetingBookings,
  useListAdminMeetingSlots,
  useCreateAdminMeetingSlot,
  useUpdateAdminMeetingBooking,
  getListAdminMeetingSlotsQueryKey,
  getListAdminMeetingBookingsQueryKey,
} from "@workspace/api-client-react";
import {
  Loader2, CalendarPlus, Check, X, Clock, Plus, Trash2,
  CalendarRange, RefreshCw, Settings2, CalendarCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScheduleRule {
  id: number;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string;
  meetLink: string | null;
  createdAt: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Raw API helpers (schedule rules are not in OpenAPI spec) ──────────────────
const API = {
  getRules: (): Promise<ScheduleRule[]> =>
    fetch("https://trivinex.onrender.com/api/admin/schedule-rules", { credentials: "include" }).then(r => {
      if (!r.ok) throw new Error("Failed to load schedule rules");
      return r.json();
    }),
  addRule: (body: { dayOfWeek: number; startTime: string; meetLink?: string }): Promise<ScheduleRule> =>
    fetch("https://trivinex.onrender.com/api/admin/schedule-rules", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => {
      if (!r.ok) throw new Error("Failed to add rule");
      return r.json();
    }),
  deleteRule: (id: number): Promise<void> =>
    fetch(`/api/admin/schedule-rules/${id}`, { method: "DELETE", credentials: "include" }).then(() => {}),
  applyRules: (): Promise<{ created: number }> =>
    fetch("https://trivinex.onrender.com/api/admin/schedule-rules/apply", { method: "POST", credentials: "include" }).then(r => r.json()),
};

// ── Single custom slot schema ─────────────────────────────────────────────────
const slotSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Time is required"),
  meetLink: z.string().optional(),
});

// ── Add time rule schema ──────────────────────────────────────────────────────
const ruleSchema = z.object({
  startTime: z.string().min(1, "Time is required"),
  meetLink: z.string().optional(),
});

export default function Consultations() {
  const { data: bookings, isLoading: loadingBookings } = useListAdminMeetingBookings();
  const { data: slots, isLoading: loadingSlots } = useListAdminMeetingSlots();
  const createSlot = useCreateAdminMeetingSlot();

  const deleteSlotMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/meeting-slots/${id}`, { method: "DELETE", credentials: "include" }).then(async r => {
        if (!r.ok) { const body = await r.json().catch(() => ({})); throw new Error((body as any)?.message || "Failed to delete slot"); }
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListAdminMeetingSlotsQueryKey() });
      toast({ title: "Slot deleted" });
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Cannot delete", description: err.message }),
  });
  const updateBooking = useUpdateAdminMeetingBooking();
  const qc = useQueryClient();
  const { toast } = useToast();

  // ── Schedule rules state ────────────────────────────────────────────────────
  const { data: rules = [], isLoading: loadingRules } = useQuery<ScheduleRule[]>({
    queryKey: ["admin-schedule-rules"],
    queryFn: API.getRules,
  });

  const addRuleMutation = useMutation({
    mutationFn: API.addRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-schedule-rules"] });
      toast({ title: "Time slot added to default schedule" });
      setAddRuleDay(null);
      ruleForm.reset();
    },
    onError: () => toast({ variant: "destructive", title: "Failed to add rule" }),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: API.deleteRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-schedule-rules"] });
      toast({ title: "Removed from default schedule" });
    },
    onError: () => toast({ variant: "destructive", title: "Failed to remove rule" }),
  });

  const applyRulesMutation = useMutation({
    mutationFn: API.applyRules,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: getListAdminMeetingSlotsQueryKey() });
      toast({
        title: res.created > 0 ? `${res.created} slots generated` : "Schedule is up to date",
        description: res.created > 0 ? "Slots created for the next 8 weeks based on your default schedule." : "No new slots needed — existing slots cover the next 8 weeks.",
      });
    },
    onError: () => toast({ variant: "destructive", title: "Failed to generate slots" }),
  });

  // ── Custom one-off slot dialog ──────────────────────────────────────────────
  const [customSlotOpen, setCustomSlotOpen] = useState(false);
  const slotForm = useForm<z.infer<typeof slotSchema>>({
    resolver: zodResolver(slotSchema),
    defaultValues: { date: "", startTime: "", meetLink: "" },
  });

  const handleCreateCustomSlot = (values: z.infer<typeof slotSchema>) => {
    createSlot.mutate({ data: { ...values, purpose: "CLIENT_MEETING", capacity: 1 } }, {
      onSuccess: () => {
        setCustomSlotOpen(false);
        slotForm.reset();
        qc.invalidateQueries({ queryKey: getListAdminMeetingSlotsQueryKey() });
        toast({ title: "Custom slot created" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: (err.data as any)?.message || err.message }),
    });
  };

  // ── Add rule dialog ─────────────────────────────────────────────────────────
  const [addRuleDay, setAddRuleDay] = useState<number | null>(null);
  const ruleForm = useForm<z.infer<typeof ruleSchema>>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { startTime: "10:00", meetLink: "" },
  });

  const handleAddRule = (values: z.infer<typeof ruleSchema>) => {
    if (addRuleDay === null) return;
    addRuleMutation.mutate({ dayOfWeek: addRuleDay, startTime: values.startTime, meetLink: values.meetLink || undefined });
  };

  // ── Booking actions ─────────────────────────────────────────────────────────
  const handleUpdateBooking = (id: number, status: "confirmed" | "cancelled") => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminMeetingBookingsQueryKey() });
        qc.invalidateQueries({ queryKey: getListAdminMeetingSlotsQueryKey() });
        toast({ title: `Booking ${status}` });
      },
    });
  };

  // ── Group rules by day ──────────────────────────────────────────────────────
  const rulesByDay = Array.from({ length: 7 }, (_, i) =>
    rules.filter(r => r.dayOfWeek === i).sort((a, b) => a.startTime.localeCompare(b.startTime))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Consultations</h1>
        <p className="text-muted-foreground font-medium">Manage your availability schedule and client booking requests.</p>
      </div>

      {/* ════════════════════════════════════════════════
           SECTION 1 — Default Weekly Schedule
      ════════════════════════════════════════════════ */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Default Weekly Schedule</CardTitle>
                <CardDescription>Set recurring availability by day. These rules are permanent until you remove them.</CardDescription>
              </div>
            </div>
            <Button
              onClick={() => applyRulesMutation.mutate()}
              disabled={applyRulesMutation.isPending || rules.length === 0}
              variant="outline"
              className="shrink-0 font-semibold"
            >
              {applyRulesMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating…</>
                : <><RefreshCw className="w-4 h-4 mr-2" /> Generate Slots (8 wks)</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingRules ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {Array.from({ length: 7 }, (_, i) => {
                  const dayRules = rulesByDay[i];
                  const hasRules = dayRules.length > 0;
                  return (
                    <div
                      key={i}
                      className={`rounded-2xl border p-3 flex flex-col gap-2 transition-colors ${
                        hasRules ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${hasRules ? "text-primary" : "text-muted-foreground"}`}>
                          {DAY_NAMES[i]}
                        </span>
                        <button
                          onClick={() => { setAddRuleDay(i); ruleForm.reset({ startTime: "10:00", meetLink: "" }); }}
                          className="w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                          title={`Add time for ${DAY_FULL[i]}`}
                        >
                          <Plus className="w-3 h-3 text-primary" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {dayRules.length === 0 ? (
                          <span className="text-[10px] text-muted-foreground/60 italic">No times set</span>
                        ) : (
                          dayRules.map(rule => (
                            <div key={rule.id} className="group flex items-center justify-between gap-1 bg-white rounded-lg px-2 py-1 border border-border shadow-sm">
                              <span className="text-xs font-semibold text-foreground tabular-nums">{rule.startTime}</span>
                              <button
                                onClick={() => deleteRuleMutation.mutate(rule.id)}
                                disabled={deleteRuleMutation.isPending}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove"
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {rules.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No default schedule set. Click <strong>+</strong> on any day to add your recurring availability.
                </p>
              )}
              {rules.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Click <strong>Generate Slots</strong> after making changes to create bookable slots for the next 8 weeks.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════════════
           SECTION 2 — Custom One-off Slots + Available Slots
      ════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Custom Slots</CardTitle>
                  <CardDescription>One-off availability on any specific date.</CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={() => setCustomSlotOpen(true)} className="font-bold shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingSlots ? (
              <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {slots?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No slots created yet. Add a custom slot or generate from your default schedule.</div>
                ) : (
                  slots?.map((slot) => (
                    <div key={slot.id} className="flex justify-between items-center p-3 border border-border rounded-xl bg-muted/20 group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{format(new Date(slot.date), "EEE, MMM d")}</div>
                          <div className="text-xs text-muted-foreground font-medium">{slot.startTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {slot.booked > 0
                          ? <Badge variant="secondary" className="text-xs">Booked</Badge>
                          : <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 bg-green-500/10">Open</Badge>}
                        {slot.booked === 0 && (
                          <button
                            onClick={() => deleteSlotMutation.mutate(slot.id)}
                            disabled={deleteSlotMutation.isPending}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-destructive"
                            title="Delete slot"
                          >
                            {deleteSlotMutation.isPending
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════════════
             SECTION 3 — Client Bookings
        ════════════════════════════════════════════════ */}
        <Card className="shadow-sm lg:col-span-3">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Client Bookings</CardTitle>
                <CardDescription>Incoming consultation requests from the public site.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingBookings ? (
              <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Client</TableHead>
                      <TableHead className="font-bold">Date & Time</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-semibold">{b.clientName}</div>
                          <div className="text-sm text-muted-foreground">{b.clientEmail}</div>
                        </TableCell>
                        <TableCell>
                          {b.slot && (
                            <>
                              <div className="font-medium">{format(new Date(b.slot.date), "MMM d, yyyy")}</div>
                              <div className="text-sm text-muted-foreground">{b.slot.startTime}</div>
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "secondary" : "outline"}
                            className={b.status === "confirmed" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {b.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateBooking(b.id, "confirmed")}>
                                <Check className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateBooking(b.id, "cancelled")}>
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {bookings?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No bookings yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Add rule dialog ──────────────────────────────────────────────────── */}
      <Dialog open={addRuleDay !== null} onOpenChange={(o) => { if (!o) setAddRuleDay(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add Time — {addRuleDay !== null ? DAY_FULL[addRuleDay] : ""}
            </DialogTitle>
            <DialogDescription>
              This time will repeat every {addRuleDay !== null ? DAY_FULL[addRuleDay] : ""} permanently. Click <strong>Generate Slots</strong> afterward to create bookable slots.
            </DialogDescription>
          </DialogHeader>
          <Form {...ruleForm}>
            <form onSubmit={ruleForm.handleSubmit(handleAddRule)} className="space-y-4 mt-2">
              <FormField control={ruleForm.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={ruleForm.control} name="meetLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Google Meet / Zoom URL" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setAddRuleDay(null)}>Cancel</Button>
                <Button type="submit" disabled={addRuleMutation.isPending} className="font-bold">
                  {addRuleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add to Schedule
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Custom one-off slot dialog ─────────────────────────────────────── */}
      <Dialog open={customSlotOpen} onOpenChange={setCustomSlotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Custom Slot</DialogTitle>
            <DialogDescription>Create a one-off availability slot on any specific date.</DialogDescription>
          </DialogHeader>
          <Form {...slotForm}>
            <form onSubmit={slotForm.handleSubmit(handleCreateCustomSlot)} className="space-y-4 mt-2">
              <FormField control={slotForm.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={slotForm.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={slotForm.control} name="meetLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Google Meet / Zoom URL" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={createSlot.isPending} className="font-bold">
                  {createSlot.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarPlus className="w-4 h-4 mr-2" />}
                  Save Slot
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
