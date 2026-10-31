import { useState } from "react";
import {
  useListAdminServices,
  useCreateAdminService,
  useUpdateAdminService,
  useDeleteAdminService,
  getListAdminServicesQueryKey,
} from "@workspace/api-client-react";
import { ServiceCategory } from "@workspace/api-client-react/api.schemas";
import {
  Plus,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { useQueryClient } from "@tanstack/react-query";

const serviceSchema = z.object({
  category: z.nativeEnum(ServiceCategory),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  icon: z.string().optional(),
  startingPrice: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const CATEGORY_LABELS: Record<string, string> = {
  WEB_DEVELOPMENT: "Web Development",
  VIDEO_EDITING: "Video Editing",
  PHOTOGRAPHY: "Photography",
  VIDEOGRAPHY: "Videography",
  GRAPHIC_DESIGN: "Graphic Design",
  SCRIPT_CONTENT_WRITING: "Script & Content Writing",
  SEO: "SEO",
  DIGITAL_MARKETING: "Digital Marketing",
  PHOTOGRAPHY_VIDEOGRAPHY: "Photography & Videography (legacy)",
  SEO_DIGITAL_MARKETING: "SEO & Digital Marketing (legacy)",
  CONTENT_WRITING: "Content Writing (legacy)",
};

export default function AdminServices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: services, isLoading } = useListAdminServices();
  const createService = useCreateAdminService();
  const updateService = useUpdateAdminService();
  const deleteService = useDeleteAdminService();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number } | null>(null);
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      category: ServiceCategory.WEB_DEVELOPMENT,
      title: "",
      slug: "",
      description: "",
      longDescription: "",
      icon: "",
      startingPrice: "",
      metaTitle: "",
      metaDescription: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  if (isLoading) return <div className="py-8">Loading services…</div>;

  const handleCreate = (values: z.infer<typeof serviceSchema>) => {
    createService.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
          toast({ title: "Service created" });
          setOpen(false);
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
      },
    );
  };

  const handleUpdate = (id: number, values: z.infer<typeof serviceSchema>) => {
    updateService.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
          toast({ title: "Service updated" });
          setOpen(false);
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this service?")) return;
    deleteService.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
          toast({ title: "Service deleted" });
        },
      },
    );
  };

  const handleToggle = (id: number, isActive: boolean) => {
    updateService.mutate(
      { id, data: { isActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Services — Admin" canonical="/admin/services" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Services</h1>
          <p className="text-[#6E6E73] text-sm">
            Manage the eight service divisions and their details.
          </p>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </DialogTrigger>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Category</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-32">Slug</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-10">Order</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(services ?? []).map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{CATEGORY_LABELS[s.category] || s.category}</TableCell>
              <TableCell className="font-medium">{s.title}</TableCell>
              <TableCell className="text-sm text-[#6E6E73]">{s.slug}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(s.id, !s.isActive)}
                >
                  {s.isActive ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                  {s.isActive ? " Active" : " Draft"}
                </Button>
              </TableCell>
              <TableCell className="text-sm">{s.sortOrder}</TableCell>
              <TableCell>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setEditing({ id: s.id }); form.reset(s as any); setOpen(true); }}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </DialogTrigger>{" "}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(s.id)}
                  disabled={deleteService.isPending}
                >
                  {deleteService.isPending ? <Loader2 className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              Manage a service division. Plans are managed separately.
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Division</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v as any)} value={field.value as any}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key as any}>
                              {label}
                            </SelectItem>
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Web Development" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl><Input placeholder="e.g. web-development" {...field} /></FormControl>
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
                    <FormControl><Textarea placeholder="Short description" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed description for the service page" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (lucide-react name)</FormLabel>
                    <FormControl><Input placeholder="e.g. Code" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicative Price Label</FormLabel>
                    <FormControl><Input placeholder="e.g. Request a quote" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl><Input placeholder="SEO title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl><Textarea placeholder="SEO description" {...field} /></FormControl>
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
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                  {editing ? "Save Changes" : "Create Service"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
