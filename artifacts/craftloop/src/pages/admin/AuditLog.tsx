import { useListAdminAuditLogs } from "@workspace/api-client-react";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";


export default function AuditLog() {
  const [search, setSearch] = useState("");
  // In a real app we'd debounce, but for now we'll just let it query or hit enter.
  // Actually, let's just pass the search term if it's > 2 chars.
  
  const { data: logs, isLoading } = useListAdminAuditLogs(
    search.length > 2 ? { q: search } : undefined
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Audit Log</h1>
        <p className="text-muted-foreground font-medium">Track sensitive actions taken across the platform.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search logs by action or actor ID..." 
          className="pl-10 h-12 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-bold w-[200px]">Timestamp</TableHead>
                  <TableHead className="font-bold w-[150px]">Actor ID</TableHead>
                  <TableHead className="font-bold w-[250px]">Action</TableHead>
                  <TableHead className="font-bold">Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.actorId}</TableCell>
                    <TableCell className="font-bold">{log.action}</TableCell>
                    <TableCell>
                      {log.metadata ? (
                        <pre className="text-xs bg-muted/50 p-2 rounded border border-border overflow-x-auto max-w-md">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {logs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No audit logs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}