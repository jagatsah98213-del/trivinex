import { useState } from "react";
import {
  useListAdminServicePlans,
  useCreateAdminServicePlan,
  useUpdateAdminServicePlan,
  useDeleteAdminServicePlan,
  getListAdminServicePlansQueryKey,
} from "@workspace/api-client-react";
import {
  PlanBadge,
  PricingType,
} from "@workspace/api-client-react/api.schemas";
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Button,
} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { useQueryClient } from "@tanstack/react-query";

const planSchema = z.object({
  serviceId: z.coerce.number().int(),
  name: z.string().min(1),
  description: z.string().min(1),
  pricingType: z.nativeEnum(PricingType),
  priceLabel: z.string().optional(),
  startingPrice: z.string().optional(),
  badge: z.nativeEnum(PlanBadge).default(PlanBadge.NONE),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const PRICING_LABELS: Record<string, string> = {
  ONE_TIME: "One-time",
  MONTHLY: "Monthly / Recurring",
  OTHER: "Custom / Quote",
};
const BADGE_LABELS: Record<string, string> = {
  NONE: "None",
  HOT: "Hot",
  NEW: "New",
  POPULAR: "Popular",
  BEST_VALUE: "Best Value",
};

export default function AdminServicePlans() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [serviceId, setServiceId] = useState<number | null>(null);
  const { data: plans, isLoading } = serviceId != null
    ? useListAdminServicePlans({ serviceId })
    : { data: [], isLoading: false };
  const createPlan = useCreateAdminServicePlan();
  const updatePlan = useUpdateAdminServicePlan();
  const deletePlan = useDeleteAdminServicePlan();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number } | null>(null);
  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      serviceId: 0,
      name: "",
      description: "",
      pricingType: PricingType.ONE_TIME,
      priceLabel: "",
      startingPrice: "",
      badge: PlanBadge.NONE,
      isActive: true,
      sortOrder: 0,
    },
  });

  if (isLoading) return <div className="py-8">Loading plans…</div>;

  const handleCreate = (values: z.infer<typeof planSchema>) => {
    createPlan.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicePlansQueryKey() });
          toast({ title: "Plan created" });
          setOpen(false);
        },
      },
    );
  };

  const handleUpdate = (id: number, values: z.infer<typeof planSchema>) => {
    updatePlan.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicePlansQueryKey() });
          toast({ title: "Plan updated" });
          setOpen(false);
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this plan?")) return;
    deletePlan.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicePlansQueryKey() });
          toast({ title: "Plan deleted" });
        },
      },
    );
  };

  const handleToggle = (id: number, isActive: boolean) => {
    updatePlan.mutate(
      { id, data: { isActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicePlansQueryKey() });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Service Plans — Admin" canonical="/admin/service-plans" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Service Plans</h1>
          <p className="text-[#6E6E73] text-sm">
            Manage editable sub-plans under each service division. Leave price labels blank to show “Request a quote.”
          </p>
        </div>
      </div>

      <div className="bg-[#F5F5F7] rounded-xl p-6 border border-[#E8E8ED]">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-[#6E6E73]">Service:</label>
          <Select
            onValueChange={(v) => setServiceId(Number(v))}
            value={serviceId ? String(serviceId) : ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {serviceId === null ? (
          <p className="text-[#6E6E73] text-sm">Select a service to manage its plans.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => { setEditing(null); form.reset({ serviceId }); setOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Plan
                </Button>
              </DialogTrigger>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-48">Description</TableHead>
                  <TableHead className="w-24">Pricing</TableHead>
                  <TableHead className="w-24">Price Label</TableHead>
                  <TableHead className="w-20">Badge</TableHead>
                  <TableHead className="w-10">Order</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(plans ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-[#6E6E73] line-clamp-1">{p.description}</TableCell>
                    <TableCell className="text-sm">{PRICING_LABELS[p.pricingType] || p.pricingType}</TableCell>
                    <TableCell className="text-sm text-[#6E6E73]">{p.priceLabel || "Request a quote"}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        p.badge === "NONE" ? "text-[#6E6E73] bg-[#E8E8ED]" :
                        p.badge === "HOT" ? "text-orange-600 bg-orange-50" :
                        p.badge === "NEW" ? "text-blue-600 bg-blue-50" :
                        p.badge === "POPULAR" ? "text-purple-600 bg-purple-50" :
                        p.badge === "BEST_VALUE" ? "text-green-600 bg-green-50" :
                        "text-[#6E6E73]"
                      }`}>{BADGE_LABELS[p.badge] || p.badge}</span>
                    </TableCell>
                    <TableCell className="text-sm">{p.sortOrder}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(p.id, !p.isActive)}
                      >
                        {p.isActive ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}
                        {p.isActive ? " Active" : " Draft"}
                      </Button>{" "}
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => { setEditing({ id: p.id }); form.reset(p as any); setOpen(true); }}>
                          <Edit className="w-3 h-3 mr-1" />
                        </Button>
                      </DialogTrigger>{" "}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletePlan.isPending}
                      >
                        {deletePlan.isPending ? <Loader2 className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>
              Service plans are optional — leave the price label blank to show “Request a quote.”
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              if (editing) {
                handleUpdate(editing.id, values);
              } else {
                handleCreate(values);
              }
            })} className="space-y-4 w-80">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Starter Website" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="What this plan includes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v as any)} value={field.value as any}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRICING_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key as any}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Label</FormLabel>
                    <FormControl><Input placeholder="e.g. Request a quote or Starting at NPR 10,000" {...field} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-[#6E6E73]">Leave blank to show “Request a quote.”</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Price (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g. $1,200" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v as any)} value={field.value as any}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(BADGE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key as any}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} className="w-4 h-4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
                  {editing ? "Save Changes" : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
