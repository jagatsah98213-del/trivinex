import { useState } from "react";
import {
  useListAdminTestimonials,
  useCreateAdminTestimonial,
  useUpdateAdminTestimonial,
  useDeleteAdminTestimonial,
  getListAdminTestimonialsQueryKey,
} from "@workspace/api-client-react";
import { ServiceCategory, TestimonialVideoSource } from "@workspace/api-client-react/api.schemas";
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight, Loader2, Play, Image, Video } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

const testimonialSchema = z.object({
  clientName: z.string().optional(),
  roleOrCompany: z.string().optional(),
  quote: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  avatarUrl: z.string().optional(),
  videoSource: z.nativeEnum(TestimonialVideoSource).optional().nullable(),
  videoUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  demoButtonLabel: z.string().optional(),
  serviceCategory: z.nativeEnum(ServiceCategory).optional().nullable(),
  relatedPortfolioId: z.coerce.number().int().optional().nullable(),
  caption: z.string().optional(),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

const VIDEO_SOURCE_LABELS: Record<string, string> = {
  upload: "Uploaded File",
  youtube: "YouTube",
  vimeo: "Vimeo",
  external: "External URL",
};

export default function AdminTestimonials() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: testimonials, isLoading } = useListAdminTestimonials();
  const createTestimonial = useCreateAdminTestimonial();
  const updateTestimonial = useUpdateAdminTestimonial();
  const deleteTestimonial = useDeleteAdminTestimonial();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number } | null>(null);
  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: "",
      roleOrCompany: "",
      quote: "",
      rating: null,
      avatarUrl: "",
      videoSource: null,
      videoUrl: "",
      demoUrl: "",
      demoButtonLabel: "View live demo",
      serviceCategory: null,
      relatedPortfolioId: null,
      caption: "",
      isPublished: false,
      sortOrder: 0,
    },
  });

  if (isLoading) return <div className="py-8">Loading testimonials…</div>;

  const handleCreate = (values: z.infer<typeof testimonialSchema>) => {
    createTestimonial.mutate(
      { data: { ...values, relatedPortfolioId: values.relatedPortfolioId ?? undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminTestimonialsQueryKey() });
          toast({ title: "Testimonial created" });
          setOpen(false);
        },
      },
    );
  };

  const handleUpdate = (id: number, values: z.infer<typeof testimonialSchema>) => {
    updateTestimonial.mutate(
      { id, data: { ...values, relatedPortfolioId: values.relatedPortfolioId ?? undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminTestimonialsQueryKey() });
          toast({ title: "Testimonial updated" });
          setOpen(false);
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this testimonial?")) return;
    deleteTestimonial.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminTestimonialsQueryKey() });
          toast({ title: "Testimonial deleted" });
        },
      },
    );
  };

  const handleToggle = (id: number, isPublished: boolean) => {
    updateTestimonial.mutate(
      { id, data: { isPublished } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminTestimonialsQueryKey() });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Testimonials — Admin" canonical="/admin/testimonials" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Testimonials</h1>
          <p className="text-[#6E6E73] text-sm">
            Manage text and video testimonials with live demo links.
          </p>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Testimonial
          </Button>
        </DialogTrigger>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Client</TableHead>
            <TableHead>Quote</TableHead>
            <TableHead className="w-16">Rating</TableHead>
            <TableHead className="w-20">Video</TableHead>
            <TableHead className="w-24">Live Demo</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-10">Order</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(testimonials ?? []).map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.clientName ?? "Anonymous"}</TableCell>
              <TableCell className="text-sm text-[#6E6E73] line-clamp-1">{t.quote}</TableCell>
              <TableCell className="text-sm">
                {t.rating ? Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                )) : "—"}
              </TableCell>
              <TableCell className="text-sm text-[#6E6E73]">
                {t.videoSource === "youtube" ? <span className="flex items-center gap-1"><Play className="w-3 h-3" /> YouTube</span> : t.videoSource === "vimeo" ? <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Vimeo</span> : t.videoSource === "upload" ? <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Upload</span> : "—"}
              </TableCell>
              <TableCell className="text-sm text-[#6E6E73]">
                {t.demoUrl ? <span className="text-blue-600 hover:underline">{t.demoButtonLabel || "View demo"}</span> : "—"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(t.id, !t.isPublished)}
                >
                  {t.isPublished ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}
                  {t.isPublished ? " Published" : " Draft"}
                </Button>
              </TableCell>
              <TableCell className="text-sm">{t.sortOrder}</TableCell>
              <TableCell>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setEditing({ id: t.id }); form.reset(t as any); setOpen(true); }}>
                    <Edit className="w-4 h-4 mr-1" />
                  </Button>
                </DialogTrigger>{" "}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(t.id)}
                  disabled={deleteTestimonial.isPending}
                >
                  {deleteTestimonial.isPending ? <Loader2 className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>
              Add a client testimonial. Video source can be uploaded, YouTube, Vimeo, or external URL.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              if (editing) {
                handleUpdate(editing.id, values);
              } else {
                handleCreate(values);
              }
            })} className="space-y-4 w-96">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name (optional)</FormLabel>
                    <FormControl><Input placeholder="Client or business name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleOrCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role / Company (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g. Founder, Acme Corp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial Text</FormLabel>
                    <FormControl><Textarea placeholder="What did the client say?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1–5, optional)</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v ? Number(v) : null)} value={field.value ? String(field.value) : ""}>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
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
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Source</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v || null)} value={field.value ?? ""}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None (text only)</SelectItem>
                          {Object.entries(VIDEO_SOURCE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
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
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl><Input placeholder="YouTube URL or media URL" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="demoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL (separate from video)</FormLabel>
                    <FormControl><Input placeholder="https://client-website.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="demoButtonLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo Button Label</FormLabel>
                    <FormControl><Input placeholder="View live demo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published</FormLabel>
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
                <Button type="submit" disabled={createTestimonial.isPending || updateTestimonial.isPending}>
                  {editing ? "Save Changes" : "Create Testimonial"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
