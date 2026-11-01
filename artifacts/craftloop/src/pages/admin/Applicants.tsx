import { useState, useEffect, useCallback } from "react";
import { customFetch } from "@workspace/api-client-react";
import { Loader2, Eye, XCircle, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { SEOHead } from "@/components/SEOHead";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "applied", label: "Applied" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interviewed", label: "Interviewed" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

const SERVICE_OPTIONS = [
  { value: "all", label: "All Services" },
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "VIDEO_EDITING", label: "Video Editing" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "VIDEOGRAPHY", label: "Videography" },
  { value: "GRAPHIC_DESIGN", label: "Graphic Design" },
  { value: "SCRIPT_CONTENT_WRITING", label: "Script & Content Writing" },
  { value: "SEO", label: "SEO" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing" },
];

export default function AdminApplicants() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (serviceFilter !== "all") params.set("serviceCategory", serviceFilter);

      const data = await customFetch(`/admin/applicants?${params.toString()}`, {
        method: "GET",
      });
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to load applicants" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, serviceFilter, toast]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const applicant = applicants.find((a) => a.id === selectedApplicant);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await customFetch(`/admin/applicants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setViewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-applicants"] });
      toast({ title: `Application ${status}` });
      fetchApplicants();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to update applicant" });
    }
  };

  const handleReject = (id: number) => {
    handleUpdateStatus(id, "rejected");
  };

  const handleDelete = async () => {
    if (!selectedApplicant) return;
    try {
      await customFetch(`/admin/applicants/${selectedApplicant}`, {
        method: "DELETE",
      });
      setDeleteDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedApplicant(null);
      toast({ title: "Application deleted" });
      fetchApplicants();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to delete application" });
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      applied: "bg-yellow-500 hover:bg-yellow-600",
      interview_scheduled: "bg-blue-500 hover:bg-blue-600",
      interviewed: "bg-indigo-500 hover:bg-indigo-600",
      selected: "bg-green-500 hover:bg-green-600",
      rejected: "bg-red-500 hover:bg-red-600",
    };
    return variants[status] || "bg-muted";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SEOHead title="Applicants & Interviews — Trivinex Partners Admin" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Applicants & Interviews</h1>
          <p className="text-muted-foreground font-medium">Review talent applications and manage interviews.</p>
        </div>
        <Button onClick={() => { fetchApplicants(); }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-10">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-full sm:w-[250px] h-10">
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-bold">Applicant</TableHead>
                  <TableHead className="font-bold">Specialty</TableHead>
                  <TableHead className="font-bold">Experience</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Applied</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-semibold">{app.fullName}</div>
                      <div className="text-sm text-muted-foreground">{app.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">{app.serviceCategory.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{app.yearsExperience ?? 0} yrs</TableCell>
                    <TableCell>
                      <Badge className={statusBadge(app.status)}>
                        {app.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(app.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedApplicant(app.id); setViewDialogOpen(true); }}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedApplicant(app.id); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {applicants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applicants found matching filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Applicant Details</DialogTitle>
          </DialogHeader>
          {applicant && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Name</div>
                  <div className="font-semibold">{applicant.fullName}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Contact</div>
                  <div className="font-semibold">{applicant.email}<br />{applicant.phone}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Specialty</div>
                  <Badge variant="outline">{applicant.serviceCategory.replace(/_/g, " ")}</Badge>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Experience</div>
                  <div className="font-semibold">{applicant.yearsExperience ?? 0} years</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Expected Rate</div>
                  <div className="font-semibold">{applicant.expectedRate ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Availability</div>
                  <div className="font-semibold">{applicant.availability ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Payout Method</div>
                  <div className="font-semibold">{applicant.preferredPayout?.replace(/_/g, " ") ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Status</div>
                  <Badge className={statusBadge(applicant.status)}>
                    {applicant.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>

              {applicant.portfolioLinks?.length ? (
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-2">Portfolio Links</div>
                  <div className="flex flex-wrap gap-2">
                    {applicant.portfolioLinks.map((link: string, i: number) => (
                      <Button key={i} variant="outline" size="sm" className="h-8" onClick={() => window.open(link, "_blank")}>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3" />
                          Link {i + 1}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : <span className="text-sm text-muted-foreground">None provided</span>}

              {applicant.resumeUrl && (
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-2">Resume</div>
                  <Button variant="outline" size="sm" onClick={() => window.open(applicant.resumeUrl, "_blank")}>
                    View Resume
                  </Button>
                </div>
              )}

              {applicant.equipmentOwned && (
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-2">Equipment</div>
                  <div className="text-sm bg-muted/20 p-3 rounded-lg border border-border whitespace-pre-wrap">{applicant.equipmentOwned}</div>
                </div>
              )}

              {applicant.coverNote && (
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-2">Cover Note</div>
                  <div className="text-sm bg-muted/20 p-3 rounded-lg border border-border whitespace-pre-wrap">{applicant.coverNote}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold"
                  onClick={() => { setViewDialogOpen(false); setDeleteDialogOpen(true); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Record
                </Button>
                {["applied", "interview_scheduled", "interviewed"].includes(applicant.status) && (
                  <Button variant="destructive" onClick={() => handleReject(applicant.id)}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Delete Application?</DialogTitle>
            <DialogDescription>
              This will permanently delete the application from <span className="font-semibold text-foreground">{applicant?.fullName}</span>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="font-bold">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
