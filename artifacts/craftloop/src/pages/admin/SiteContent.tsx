import { useListAdminServices, useListAdminTestimonials, useUpdateAdminTestimonial, getListAdminTestimonialsQueryKey, useListAdminPortfolioItems, useCreateAdminPortfolioItem, getListAdminPortfolioItemsQueryKey, getListAdminServicesQueryKey } from "@workspace/api-client-react";
import { Loader2, ExternalLink, Plus, Check, X, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp, BarChart3, Phone, Mail, MessageCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { PortfolioItemInputMediaType, ServiceCategory } from "@workspace/api-client-react/api.schemas";

// ─── Site Settings hooks ───────────────────────────────────────────────────────
interface SiteSetting { key: string; value: string; label: string }

function useSiteSettings() {
  return useQuery<SiteSetting[]>({
    queryKey: ["admin-site-settings"],
    queryFn: () => fetch("https://trivinex.onrender.com/api/admin/site-settings", { credentials: "include" }).then(r => r.json()),
  });
}

function useUpdateSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      fetch(`/api/admin/site-settings/${encodeURIComponent(key)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
      qc.invalidateQueries({ queryKey: ["public-site-settings"] });
    },
  });
}

// ─── Stats Editor ──────────────────────────────────────────────────────────────
function SiteStatsPanel({ settings }: { settings: SiteSetting[] }) {
  const { toast } = useToast();
  const updateSetting = useUpdateSiteSetting();

  const statKeys = [
    { valueKey: "stat_1_value", labelKey: "stat_1_label", title: "Stat 1" },
    { valueKey: "stat_2_value", labelKey: "stat_2_label", title: "Stat 2" },
    { valueKey: "stat_3_value", labelKey: "stat_3_label", title: "Stat 3" },
    { valueKey: "stat_4_value", labelKey: "stat_4_label", title: "Stat 4" },
    { valueKey: "hero_revenue", labelKey: null, title: "Hero Card Revenue" },
  ];

  const getVal = (key: string) => settings.find(s => s.key === key)?.value ?? "";
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = (key: string) => drafts[key] ?? getVal(key);

  const save = (key: string) => {
    const value = draft(key);
    updateSetting.mutate({ key, value }, {
      onSuccess: () => toast({ title: "Saved" }),
      onError: () => toast({ variant: "destructive", title: "Save failed" }),
    });
  };

  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground">These numbers appear in the dark stats bar on the homepage and in the hero dashboard card.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {statKeys.map(({ valueKey, labelKey, title }) => (
          <div key={valueKey} className="border border-border rounded-xl p-4 space-y-3 bg-background">
            <p className="text-sm font-bold text-foreground">{title}</p>
            <div className="flex gap-2">
              <Input
                placeholder="Value (e.g. 200+)"
                value={draft(valueKey)}
                onChange={e => setDrafts(d => ({ ...d, [valueKey]: e.target.value }))}
              />
              <Button size="sm" variant="outline" onClick={() => save(valueKey)} disabled={updateSetting.isPending}>
                <Save className="w-3.5 h-3.5" />
              </Button>
            </div>
            {labelKey && (
              <div className="flex gap-2">
                <Input
                  placeholder="Label (e.g. Clients Served)"
                  value={draft(labelKey)}
                  onChange={e => setDrafts(d => ({ ...d, [labelKey]: e.target.value }))}
                />
                <Button size="sm" variant="outline" onClick={() => save(labelKey)} disabled={updateSetting.isPending}>
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact Info Editor ────────────────────────────────────────────────────────
function ContactInfoPanel({ settings }: { settings: SiteSetting[] }) {
  const { toast } = useToast();
  const updateSetting = useUpdateSiteSetting();
  const getVal = (key: string) => settings.find(s => s.key === key)?.value ?? "";
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = (key: string) => drafts[key] ?? getVal(key);

  const save = (key: string) => {
    updateSetting.mutate({ key, value: draft(key) }, {
      onSuccess: () => toast({ title: "Contact info saved" }),
      onError: () => toast({ variant: "destructive", title: "Save failed" }),
    });
  };

  const fields = [
    { key: "contact_email", label: "Email Address", placeholder: "hello@yourcompany.com", icon: <Mail className="w-4 h-4 text-muted-foreground" />, hint: "Opens email client (mailto:)" },
    { key: "contact_phone", label: "Phone Number", placeholder: "+1 (555) 000-0000", icon: <Phone className="w-4 h-4 text-muted-foreground" />, hint: "Opens phone dialer (tel:)" },
    { key: "contact_whatsapp", label: "WhatsApp Number", placeholder: "15550000000 (no + or spaces)", icon: <MessageCircle className="w-4 h-4 text-muted-foreground" />, hint: "Opens WhatsApp (wa.me/) — digits only, include country code" },
  ];

  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground">Contact links appear in the website footer. Visitors can click them to call, email, or message you on WhatsApp.</p>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, icon, hint }) => (
          <div key={key} className="border border-border rounded-xl p-4 bg-background">
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <p className="text-sm font-bold">{label}</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={placeholder}
                value={draft(key)}
                onChange={e => setDrafts(d => ({ ...d, [key]: e.target.value }))}
              />
              <Button size="sm" onClick={() => save(key)} disabled={updateSetting.isPending}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SMTP Settings panel ────────────────────────────────────────────────────────
function SmtpInfoPanel() {
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        Automated emails are sent via SMTP whenever a client submits a quote request or a freelancer submits an application.
        Configure the following environment variables on your server to enable email sending:
      </p>
      <div className="rounded-xl bg-muted/60 p-4 font-mono text-xs space-y-1 text-foreground">
        {[
          ["SMTP_HOST", "Your SMTP host (e.g. smtp.gmail.com)"],
          ["SMTP_PORT", "587 (TLS) or 465 (SSL)"],
          ["SMTP_USER", "Your SMTP username / email"],
          ["SMTP_PASS", "Your SMTP password or app password"],
          ["SMTP_FROM", "Sender display address (optional, defaults to SMTP_USER)"],
        ].map(([key, desc]) => (
          <div key={key} className="flex gap-3">
            <span className="text-blue-600 font-bold w-28 shrink-0">{key}</span>
            <span className="text-muted-foreground"># {desc}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Works with Gmail, SendGrid, Mailgun, Zoho, or any standard SMTP provider. If SMTP is not configured, emails are silently skipped — the app still works normally.</p>
    </div>
  );
}

// ─── Portfolio schema ──────────────────────────────────────────────────────────
const portSchema = z.object({
  title: z.string().min(2, "Title is required"),
  serviceCategory: z.nativeEnum(ServiceCategory),
  mediaType: z.nativeEnum(PortfolioItemInputMediaType),
  mediaUrl: z.string().url(),
});

// ─── FAQ types & hooks ─────────────────────────────────────────────────────────
interface Faq { id: number; question: string; answer: string; sortOrder: number; isPublished: boolean }

const faqSchema = z.object({
  question: z.string().min(5, "Question is required"),
  answer: z.string().min(10, "Answer is required"),
});

function useFaqs() {
  return useQuery<Faq[]>({
    queryKey: ["admin-faqs"],
    queryFn: () => fetch("https://trivinex.onrender.com/api/admin/faqs", { credentials: "include" }).then(r => r.json()),
  });
}

function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { question: string; answer: string }) =>
      fetch("https://trivinex.onrender.com/api/admin/faqs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Faq> }) =>
      fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/faqs/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

// ─── Service Plan types & hooks ────────────────────────────────────────────────
interface ServicePlanItem {
  id: number;
  serviceId: number;
  name: string;
  description: string;
  pricingType: "ONE_TIME" | "MONTHLY";
  startingPrice: string | null;
  badge: "NONE" | "HOT" | "NEW" | "POPULAR" | "BEST_VALUE";
  isActive: boolean;
  sortOrder: number;
}

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricingType: z.enum(["ONE_TIME", "MONTHLY"]),
  startingPrice: z.string().optional(),
  badge: z.enum(["NONE", "HOT", "NEW", "POPULAR", "BEST_VALUE"]),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int(),
});

function useServicePlans(serviceId: number | null) {
  return useQuery<ServicePlanItem[]>({
    queryKey: ["admin-service-plans", serviceId],
    queryFn: () => fetch(`/api/admin/service-plans?serviceId=${serviceId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!serviceId,
  });
}

function useCreateServicePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof planSchema> & { serviceId: number }) =>
      fetch("https://trivinex.onrender.com/api/admin/service-plans", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (_data: ServicePlanItem, vars: z.infer<typeof planSchema> & { serviceId: number }) => {
      qc.invalidateQueries({ queryKey: ["admin-service-plans", vars.serviceId] });
      qc.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
    },
  });
}

function useUpdateServicePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, serviceId: _sid, data }: { id: number; serviceId: number; data: Partial<z.infer<typeof planSchema>> }) =>
      fetch(`/api/admin/service-plans/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (_data: ServicePlanItem, vars: { id: number; serviceId: number; data: Partial<z.infer<typeof planSchema>> }) => {
      qc.invalidateQueries({ queryKey: ["admin-service-plans", vars.serviceId] });
      qc.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
    },
  });
}

function useDeleteServicePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; serviceId: number }) =>
      fetch(`/api/admin/service-plans/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: (_data: unknown, vars: { id: number; serviceId: number }) => {
      qc.invalidateQueries({ queryKey: ["admin-service-plans", vars.serviceId] });
      qc.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
    },
  });
}

const planBadgeStyles: Record<string, string> = {
  NONE: "bg-muted text-muted-foreground",
  HOT: "bg-red-500 text-white border-0",
  NEW: "bg-blue-500 text-white border-0",
  POPULAR: "bg-amber-500 text-white border-0",
  BEST_VALUE: "bg-purple-500 text-white border-0",
};

function ServicePlansPanel({ serviceId, serviceName }: { serviceId: number; serviceName: string }) {
  const { toast } = useToast();
  const { data: plans, isLoading } = useServicePlans(serviceId);
  const createPlan = useCreateServicePlan();
  const updatePlan = useUpdateServicePlan();
  const deletePlan = useDeleteServicePlan();

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ServicePlanItem | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<ServicePlanItem | null>(null);

  const planForm = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: "", description: "", pricingType: "ONE_TIME", startingPrice: "", badge: "NONE", isActive: true, sortOrder: 1 },
  });

  const openNewPlan = () => {
    setEditingPlan(null);
    planForm.reset({ name: "", description: "", pricingType: "ONE_TIME", startingPrice: "", badge: "NONE", isActive: true, sortOrder: (plans?.length ?? 0) + 1 });
    setPlanDialogOpen(true);
  };

  const openEditPlan = (plan: ServicePlanItem) => {
    setEditingPlan(plan);
    planForm.reset({ name: plan.name, description: plan.description, pricingType: plan.pricingType, startingPrice: plan.startingPrice ?? "", badge: plan.badge, isActive: plan.isActive, sortOrder: plan.sortOrder });
    setPlanDialogOpen(true);
  };

  const handlePlanSubmit = (values: z.infer<typeof planSchema>) => {
    if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, serviceId, data: values }, {
        onSuccess: () => { setPlanDialogOpen(false); toast({ title: "Plan updated" }); },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err?.data?.message || err?.message }),
      });
    } else {
      createPlan.mutate({ ...values, serviceId }, {
        onSuccess: () => { setPlanDialogOpen(false); planForm.reset(); toast({ title: "Plan added" }); },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err?.data?.message || err?.message }),
      });
    }
  };

  const handleDeletePlan = () => {
    if (!deletingPlan) return;
    deletePlan.mutate({ id: deletingPlan.id, serviceId }, {
      onSuccess: () => { setDeletingPlan(null); toast({ title: "Plan deleted" }); },
    });
  };

  return (
    <CardContent className="p-0">
      <div className="flex justify-end px-4 py-3 border-b border-border/50 bg-background">
        <Button size="sm" onClick={openNewPlan}><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Price</TableHead>
              <TableHead className="font-bold">Badge</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold w-12">Sort</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map(plan => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-xs text-muted-foreground max-w-xs truncate">{plan.description}</div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{plan.pricingType === "MONTHLY" ? "Monthly" : "One-time"}</Badge></TableCell>
                <TableCell className="text-sm">{plan.startingPrice || "—"}</TableCell>
                <TableCell><Badge className={`text-xs ${planBadgeStyles[plan.badge]}`}>{plan.badge}</Badge></TableCell>
                <TableCell>
                  <Badge className={plan.isActive ? "bg-green-500 hover:bg-green-600" : "bg-muted text-muted-foreground hover:bg-muted"}>
                    {plan.isActive ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{plan.sortOrder}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditPlan(plan)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeletingPlan(plan)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {plans?.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-sm">No plans yet. Add the first plan for {serviceName}.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingPlan ? "Edit Plan" : "Add Plan"} — {serviceName}</DialogTitle></DialogHeader>
          <Form {...planForm}>
            <form onSubmit={planForm.handleSubmit(handlePlanSubmit)} className="space-y-4 mt-2">
              <FormField control={planForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={planForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[80px] resize-y" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={planForm.control} name="pricingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ONE_TIME">One-time</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={planForm.control} name="badge" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="HOT">🔥 Hot</SelectItem>
                        <SelectItem value="NEW">✨ New</SelectItem>
                        <SelectItem value="POPULAR">⭐ Popular</SelectItem>
                        <SelectItem value="BEST_VALUE">💎 Best Value</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={planForm.control} name="startingPrice" render={({ field }) => (
                  <FormItem><FormLabel>Starting Price (Optional)</FormLabel><FormControl><Input placeholder="e.g. Starting at $299" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={planForm.control} name="sortOrder" render={({ field }) => (
                  <FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={planForm.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-3 py-1">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">Active (visible to clients on the Services page)</FormLabel>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
                  {(createPlan.isPending || updatePlan.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingPlan ? "Save Changes" : "Add Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deletingPlan} onOpenChange={open => !open && setDeletingPlan(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete "{deletingPlan?.name}"?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove this plan. Existing inquiry references will lose the plan link.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPlan(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={deletePlan.isPending}>
              {deletePlan.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}

export default function SiteContent() {
  const { data: services, isLoading: loadingServices } = useListAdminServices();
  const { data: testimonials, isLoading: loadingTestimonials } = useListAdminTestimonials();
  const { data: portfolio, isLoading: loadingPortfolio } = useListAdminPortfolioItems();
  const { data: faqs, isLoading: loadingFaqs } = useFaqs();
  const { data: siteSettings = [], isLoading: loadingSettings } = useSiteSettings();

  const updateTestimonial = useUpdateAdminTestimonial();
  const createPortfolio = useCreateAdminPortfolioItem();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Portfolio dialog
  const [portDialogOpen, setPortDialogOpen] = useState(false);
  const portForm = useForm<z.infer<typeof portSchema>>({
    resolver: zodResolver(portSchema),
    defaultValues: { title: "", mediaUrl: "", mediaType: "image", serviceCategory: undefined }
  });

  // FAQ dialogs
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<number | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);

  const faqForm = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: "", answer: "" },
  });

  const handleTestimonialToggle = (id: number, current: boolean) => {
    updateTestimonial.mutate({ id, data: { isPublished: !current } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdminTestimonialsQueryKey() })
    });
  };

  const handleCreatePortfolio = (values: z.infer<typeof portSchema>) => {
    createPortfolio.mutate({ data: { ...values, isFeatured: false, sortOrder: 0 } }, {
      onSuccess: () => {
        setPortDialogOpen(false);
        portForm.reset();
        queryClient.invalidateQueries({ queryKey: getListAdminPortfolioItemsQueryKey() });
        toast({ title: "Portfolio item added" });
      }
    });
  };

  const openNewFaq = () => {
    setEditingFaq(null);
    faqForm.reset({ question: "", answer: "" });
    setFaqDialogOpen(true);
  };

  const openEditFaq = (faq: Faq) => {
    setEditingFaq(faq);
    faqForm.reset({ question: faq.question, answer: faq.answer });
    setFaqDialogOpen(true);
  };

  const handleFaqSubmit = (values: z.infer<typeof faqSchema>) => {
    if (editingFaq) {
      updateFaq.mutate({ id: editingFaq.id, data: values }, {
        onSuccess: () => {
          setFaqDialogOpen(false);
          toast({ title: "FAQ updated" });
        },
      });
    } else {
      createFaq.mutate(values, {
        onSuccess: () => {
          setFaqDialogOpen(false);
          faqForm.reset();
          toast({ title: "FAQ added" });
        },
      });
    }
  };

  const handleToggleFaqPublished = (faq: Faq) => {
    updateFaq.mutate({ id: faq.id, data: { isPublished: !faq.isPublished } }, {
      onSuccess: () => toast({ title: faq.isPublished ? "FAQ hidden" : "FAQ published" }),
    });
  };

  const handleDeleteFaq = () => {
    if (deletingFaqId == null) return;
    deleteFaq.mutate(deletingFaqId, {
      onSuccess: () => {
        setDeletingFaqId(null);
        toast({ title: "FAQ deleted" });
      },
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Site Content</h1>
        <p className="text-muted-foreground font-medium">Manage public-facing website data.</p>
      </div>

      {/* ── Homepage Stats ── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Homepage Stats</h2>
        </div>
        <Card className="shadow-sm overflow-hidden">
          {loadingSettings ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <SiteStatsPanel settings={siteSettings} />
          )}
        </Card>
      </section>

      {/* ── Contact Info ── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Contact Information</h2>
        </div>
        <Card className="shadow-sm overflow-hidden">
          {loadingSettings ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <ContactInfoPanel settings={siteSettings} />
          )}
        </Card>
      </section>

      {/* ── Email Automation ── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold">Automated Emails</h2>
          </div>
        </div>
        <Card className="shadow-sm overflow-hidden">
          <SmtpInfoPanel />
        </Card>
      </section>

      {/* ── Services ── */}
      <section>
        <h2 className="text-xl font-bold mb-4">Services Matrix</h2>
        <Card className="shadow-sm">
          {loadingServices ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Title</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Base Price</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold">{s.title}</TableCell>
                    <TableCell><Badge variant="outline">{s.category.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{s.startingPrice || "N/A"}</TableCell>
                    <TableCell><Badge className="bg-green-500 hover:bg-green-600">Active</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      {/* ── Service Plans ── */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Service Plans</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage the pricing plans shown on the Services page and the Quote form for each service.</p>
        </div>
        <div className="space-y-3">
          {loadingServices ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            services?.map(service => {
              const isExpanded = expandedServiceId === service.id;
              return (
                <Card key={service.id} className="shadow-sm overflow-hidden">
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                  >
                    <div>
                      <div className="font-bold">{service.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.plans?.length ?? 0} plan{(service.plans?.length ?? 0) !== 1 ? "s" : ""} · {service.category.replace(/_/g, " ")}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="pointer-events-none">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                  {isExpanded && <ServicePlansPanel serviceId={service.id} serviceName={service.title} />}
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* ── Portfolio ── */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Portfolio Showcase</h2>
          <Button size="sm" onClick={() => setPortDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {loadingPortfolio ? (
            <div className="col-span-full flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            portfolio?.map(p => (
              <Card key={p.id} className="overflow-hidden shadow-sm">
                <div className="aspect-video bg-muted relative">
                  {p.mediaType === 'image' && <img src={p.mediaUrl} className="object-cover w-full h-full" alt={p.title} />}
                  {p.mediaType !== 'image' && <div className="absolute inset-0 flex items-center justify-center bg-primary/5 font-bold uppercase tracking-widest text-primary/50">{p.mediaType}</div>}
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">{p.serviceCategory.replace(/_/g, " ")}</Badge>
                  <div className="font-bold truncate">{p.title}</div>
                  <Button variant="link" className="px-0 h-auto text-xs mt-2 text-primary" onClick={() => window.open(p.mediaUrl, "_blank")}>
                    View Asset <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section>
        <h2 className="text-xl font-bold mb-4">Testimonials (Moderation)</h2>
        <Card className="shadow-sm">
          {loadingTestimonials ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold w-[200px]">Client</TableHead>
                  <TableHead className="font-bold">Quote</TableHead>
                  <TableHead className="font-bold w-[100px]">Rating</TableHead>
                  <TableHead className="font-bold w-[120px]">Status</TableHead>
                  <TableHead className="text-right font-bold w-[100px]">Toggle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials?.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-bold">{t.clientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground italic">"{t.quote}"</TableCell>
                    <TableCell>{t.rating} / 5</TableCell>
                    <TableCell>
                      {t.isPublished ? <Badge className="bg-green-500">Published</Badge> : <Badge variant="secondary">Hidden</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleTestimonialToggle(t.id, t.isPublished)}>
                        {t.isPublished ? <X className="w-4 h-4 text-destructive" /> : <Check className="w-4 h-4 text-green-500" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      {/* ── FAQs ── */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Freelancer FAQs</h2>
            <p className="text-sm text-muted-foreground mt-0.5">These appear on the public Freelancers page.</p>
          </div>
          <Button size="sm" onClick={openNewFaq}><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
        </div>
        <Card className="shadow-sm">
          {loadingFaqs ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !faqs?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No FAQs yet. Add one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold w-8" />
                  <TableHead className="font-bold">Question</TableHead>
                  <TableHead className="font-bold hidden md:table-cell">Answer (preview)</TableHead>
                  <TableHead className="font-bold w-[110px] text-center">Status</TableHead>
                  <TableHead className="font-bold text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map(faq => (
                  <TableRow key={faq.id}>
                    <TableCell className="text-muted-foreground/40">
                      <GripVertical className="w-4 h-4" />
                    </TableCell>
                    <TableCell className="font-semibold max-w-[240px]">
                      <p className="truncate">{faq.question}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden md:table-cell max-w-[300px]">
                      <p className="truncate">{faq.answer}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleFaqPublished(faq)}
                        className="focus:outline-none"
                      >
                        {faq.isPublished
                          ? <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">Published</Badge>
                          : <Badge variant="secondary" className="cursor-pointer">Hidden</Badge>
                        }
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditFaq(faq)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeletingFaqId(faq.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      {/* Portfolio dialog */}
      <Dialog open={portDialogOpen} onOpenChange={setPortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Portfolio Item</DialogTitle>
          </DialogHeader>
          <Form {...portForm}>
            <form onSubmit={portForm.handleSubmit(handleCreatePortfolio)} className="space-y-4">
              <FormField control={portForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={portForm.control} name="serviceCategory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem>
                      <SelectItem value="VIDEO_EDITING">Video Editing</SelectItem>
                      <SelectItem value="PHOTOGRAPHY_VIDEOGRAPHY">Photography & Videography</SelectItem>
                      <SelectItem value="GRAPHIC_DESIGN">Graphic Design</SelectItem>
                      <SelectItem value="CONTENT_WRITING">Content Writing</SelectItem>
                      <SelectItem value="SEO_DIGITAL_MARKETING">SEO & Digital Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={portForm.control} name="mediaType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Media Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="image">Image URL</SelectItem>
                      <SelectItem value="video">Video URL</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={portForm.control} name="mediaUrl" render={({ field }) => (
                <FormItem><FormLabel>Asset URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createPortfolio.isPending}>Save Item</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* FAQ create/edit dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <Form {...faqForm}>
            <form onSubmit={faqForm.handleSubmit(handleFaqSubmit)} className="space-y-4">
              <FormField control={faqForm.control} name="question" render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. How do payouts work?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={faqForm.control} name="answer" render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a clear, concise answer..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFaqDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createFaq.isPending || updateFaq.isPending}>
                  {editingFaq ? "Save Changes" : "Add FAQ"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* FAQ delete confirm dialog */}
      <Dialog open={deletingFaqId != null} onOpenChange={(o) => !o && setDeletingFaqId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this FAQ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove the FAQ from the public page. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingFaqId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteFaq} disabled={deleteFaq.isPending}>
              {deleteFaq.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
