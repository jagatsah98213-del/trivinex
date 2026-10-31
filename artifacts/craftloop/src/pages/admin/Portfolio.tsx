import { useState } from "react";
import {
  useListAdminPortfolioItems,
  useCreateAdminPortfolioItem,
  useUpdateAdminPortfolioItem,
  useDeleteAdminPortfolioItem,
  getListAdminPortfolioItemsQueryKey,
} from "@workspace/api-client-react";
import { ServiceCategory, PortfolioItemMediaType } from "@workspace/api-client-react/api.schemas";
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight, Loader2, Image, Video, Link } from "lucide-react";
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

const portfolioSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory),
  title: z.string().min(1),
  description: z.string().optional(),
  clientName: z.string().optional(),
  mediaType: z.nativeEnum(PortfolioItemMediaType),
  mediaUrl: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  liveDemoUrl: z.string().optional(),
  demoButtonLabel: z.string().optional(),
  caption: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const MEDIA_LABELS: Record<string, string> = {
  image: "Image",
  video: "Video",
  link: "Link",
};

export default function AdminPortfolio() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useListAdminPortfolioItems();
  const createItem = useCreateAdminPortfolioItem();
  const updateItem = useUpdateAdminPortfolioItem();
  const deleteItem = useDeleteAdminPortfolioItem();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number } | null>(null);
  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      serviceCategory: ServiceCategory.WEB_DEVELOPMENT,
      title: "",
      description: "",
      clientName: "",
      mediaType: "image",
      mediaUrl: "",
      thumbnailUrl: "",
      liveDemoUrl: "",
      demoButtonLabel: "View live demo",
      caption: "",
      isFeatured: false,
      isPublished: true,
      sortOrder: 0,
    },
  });

  if (isLoading) return <div className="py-8">Loading portfolio…</div>;

  const handleCreate = (values: z.infer<typeof portfolioSchema>) => {
    createItem.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminPortfolioItemsQueryKey() });
          toast({ title: "Portfolio item created" });
          setOpen(false);
        },
      },
    );
  };

  const handleUpdate = (id: number, values: z.infer<typeof portfolioSchema>) => {
    updateItem.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminPortfolioItemsQueryKey() });
          toast({ title: "Portfolio item updated" });
          setOpen(false);
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this portfolio item?")) return;
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminPortfolioItemsQueryKey() });
          toast({ title: "Portfolio item deleted" });
        },
      },
    );
  };

  const handleToggle = (id: number, isPublished: boolean) => {
    updateItem.mutate(
      { id, data: { isPublished } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminPortfolioItemsQueryKey() });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Portfolio — Admin" canonical="/admin/portfolio" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Portfolio</h1>
          <p className="text-[#6E6E73] text-sm">
            Manage portfolio items and case studies with live demo links.
          </p>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Portfolio Item
          </Button>
        </DialogTrigger>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Category</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-20">Media</TableHead>
            <TableHead className="w-32">Live Demo</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-10">Order</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(items ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.serviceCategory}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell className="text-sm text-[#6E6E73]">
                {item.mediaType === "image" ? <Image className="w-3 h-3 mr-1" /> : item.mediaType === "video" ? <Video className="w-3 h-3 mr-1" /> : <Link className="w-3 h-3 mr-1" />}{item.mediaType}
              </TableCell>
              <TableCell className="text-sm text-[#6E6E73]">
                {item.liveDemoUrl ? (
                  <span className="flex items-center gap-1">
                    <a href={item.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.demoButtonLabel || "View demo"}</a>
                  </span>
                ) : "—"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(item.id, !item.isPublished)}
                >
                  {item.isPublished ? " Published" : " Draft"}
                </Button>
              </TableCell>
              <TableCell className="text-sm">{item.sortOrder}</TableCell>
              <TableCell>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setEditing({ id: item.id }); form.reset(item as any); setOpen(true); }}>
                    <Edit className="w-4 h-4 mr-1" />
                  </Button>
                </DialogTrigger>{" "}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteItem.isPending}
                >
                  {deleteItem.isPending ? <Loader2 className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Portfolio Item" : "Add Portfolio Item"}</DialogTitle>
            <DialogDescription>
              Add a case study or portfolio piece. The live demo URL is a separate link from the media.
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
                name="serviceCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Division</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v as any)} value={field.value as any}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[ServiceCategory.WEB_DEVELOPMENT, ServiceCategory.VIDEO_EDITING, ServiceCategory.PHOTOGRAPHY, ServiceCategory.VIDEOGRAPHY, ServiceCategory.GRAPHIC_DESIGN, ServiceCategory.SCRIPT_CONTENT_WRITING, ServiceCategory.SEO, ServiceCategory.DIGITAL_MARKETING].map((c) => (
                            <SelectItem key={c} value={c as any}>{c}</SelectItem>
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
                    <FormControl><Input placeholder="e.g. Luxe Realty Website" {...field} /></FormControl>
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
                    <FormControl><Textarea placeholder="Case study details" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name (optional, approved only)</FormLabel>
                    <FormControl><Input placeholder="Client or business name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(v as any)} value={field.value as any}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(MEDIA_LABELS).map(([key, label]) => (
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
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL (optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="liveDemoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL (separate from media)</FormLabel>
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
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption / Alt Text</FormLabel>
                    <FormControl><Input placeholder="Accessible description" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured</FormLabel>
                    <FormControl>
                      <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} className="w-4 h-4" />
                    </FormControl>
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
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                  {editing ? "Save Changes" : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
