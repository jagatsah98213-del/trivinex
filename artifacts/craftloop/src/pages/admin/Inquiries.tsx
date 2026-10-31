import {
  useListAdminInquiries, useListAdminServices, useConvertInquiryToProject,
  getListAdminInquiriesQueryKey, useUpdateAdminInquiry, useDeleteAdminInquiry,
} from "@workspace/api-client-react";
import { Loader2, Plus, Eye, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const convertSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
});

export default function Inquiries() {
  const { data: inquiries, isLoading } = useListAdminInquiries();
  const updateInquiry = useUpdateAdminInquiry();
  const deleteInquiry = useDeleteAdminInquiry();
  const convertToProject = useConvertInquiryToProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services } = useListAdminServices();
  const planMap = new Map<number, string>(
    services?.flatMap(s => s.plans?.map(p => [p.id, p.name] as [number, string]) ?? []) ?? []
  );

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<number | null>(null);

  const inquiry = inquiries?.find(i => i.id === selectedInquiry);

  const form = useForm<z.infer<typeof convertSchema>>({
    resolver: zodResolver(convertSchema),
    defaultValues: { title: "", description: "", deadline: "" }
  });

  const handleOpenConvert = (id: number) => {
    setSelectedInquiry(id);
    const inq = inquiries?.find(i => i.id === id);
    if (inq) {
      form.reset({
        title: `${inq.serviceNeeded.replace(/_/g, " ")} Project for ${inq.name}`,
        description: inq.projectDetails,
        deadline: ""
      });
      setViewDialogOpen(false);
      setConvertDialogOpen(true);
    }
  };

  const handleConvert = (values: z.infer<typeof convertSchema>) => {
    if (!selectedInquiry) return;
    convertToProject.mutate({ id: selectedInquiry, data: values }, {
      onSuccess: () => {
        setConvertDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListAdminInquiriesQueryKey() });
        toast({ title: "Project created", description: "Inquiry converted successfully." });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: (err.data as any)?.message || err.message })
    });
  };

  const handleUpdateStatus = (id: number, status: "contacted" | "closed") => {
    updateInquiry.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminInquiriesQueryKey() });
        toast({ title: "Status updated" });
      }
    });
  };

  const handleDelete = () => {
    if (!selectedInquiry) return;
    deleteInquiry.mutate({ id: selectedInquiry }, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setViewDialogOpen(false);
        setSelectedInquiry(null);
        queryClient.invalidateQueries({ queryKey: getListAdminInquiriesQueryKey() });
        toast({ title: "Inquiry deleted" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: (err.data as any)?.message || err.message })
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Client Inquiries</h1>
        <p className="text-muted-foreground font-medium">Review quote requests and convert them to active projects.</p>
      </div>

      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-bold">Client</TableHead>
                  <TableHead className="font-bold">Service Requested</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Received</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries?.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell>
                      <div className="font-semibold">{inq.name}</div>
                      <div className="text-sm text-muted-foreground">{inq.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">{inq.serviceNeeded.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        inq.status === 'new' ? 'bg-blue-500 hover:bg-blue-600' :
                        inq.status === 'won' ? 'bg-green-500 hover:bg-green-600' :
                        inq.status === 'closed' ? 'bg-muted text-muted-foreground hover:bg-muted' :
                        'bg-yellow-500 hover:bg-yellow-600'
                      }>
                        {inq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(inq.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedInquiry(inq.id); setViewDialogOpen(true); }}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        {inq.status !== 'won' && inq.status !== 'closed' && (
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleOpenConvert(inq.id)}>
                            <Plus className="w-4 h-4 mr-2" /> Convert
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedInquiry(inq.id); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {inquiries?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No inquiries found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Inquiry Details</DialogTitle>
          </DialogHeader>
          {inquiry && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Client Name</div>
                  <div className="font-semibold">{inquiry.name}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Contact</div>
                  <div className="font-semibold">{inquiry.email}<br/>{inquiry.phone}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Service</div>
                  <Badge variant="outline">{inquiry.serviceNeeded.replace(/_/g, " ")}</Badge>
                  {inquiry.servicePlanId && planMap.get(inquiry.servicePlanId) && (
                    <div className="text-xs text-muted-foreground mt-1.5 font-medium">
                      Plan: {planMap.get(inquiry.servicePlanId)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Budget / Timeline</div>
                  <div className="font-semibold">{inquiry.budgetRange || "N/A"} / {inquiry.timeline || "N/A"}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-muted-foreground mb-2">Project Details</div>
                <div className="text-sm bg-muted/20 p-4 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">{inquiry.projectDetails}</div>
              </div>

              {inquiry.status === "new" && (
                <div className="flex justify-end gap-3 pt-4">
                   <Button variant="outline" onClick={() => handleUpdateStatus(inquiry.id, "closed")}>Mark Closed</Button>
                   <Button variant="secondary" onClick={() => handleUpdateStatus(inquiry.id, "contacted")}>Mark Contacted</Button>
                   <Button onClick={() => handleOpenConvert(inquiry.id)}><Plus className="w-4 h-4 mr-2" /> Convert to Project</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Convert to Project</DialogTitle>
            <DialogDescription>Create a new active project from this inquiry.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleConvert)} className="space-y-4 mt-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="deadline" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={convertToProject.isPending}>
                  {convertToProject.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Create Project
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Delete Inquiry?</DialogTitle>
            <DialogDescription>
              This will permanently delete the inquiry from <span className="font-semibold text-foreground">{inquiry?.name}</span>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteInquiry.isPending} className="font-bold">
              {deleteInquiry.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Inquiry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
