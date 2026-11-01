import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLogout, useGetCurrentUser } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  FolderKanban,
  Palette,
  Image,
  Quote,
  Settings,
  History,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [csrfInitialized, setCsrfInitialized] = useState(false);

  // Ensure CSRF token is set in session before any admin mutations.
  // This prevents "Invalid or missing CSRF token" errors on edit/delete/convert.
  useEffect(() => {
    let cancelled = false;
    async function initCsrf() {
      try {
        await customFetch("/api/admin/csrf-token", { method: "GET" });
      } catch {
        // CSRF token will be fetched on first mutation by customFetch auto-fallback
      }
      if (!cancelled) setCsrfInitialized(true);
    }
    if (user) initCsrf();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      setLocation("/admin/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!user || user.role !== "ADMIN") return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin/login");
      },
    });
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/applicants", icon: Users, label: "Applicants" },
    { href: "/admin/inquiries", icon: FileText, label: "Client Inquiries" },
    { href: "/admin/consultations", icon: Calendar, label: "Consultations" },
    { href: "/admin/projects", icon: FolderKanban, label: "Projects" },
    { href: "/admin/services", icon: Palette, label: "Services" },
    { href: "/admin/service-plans", icon: Palette, label: "Service Plans" },
    { href: "/admin/portfolio", icon: Image, label: "Portfolio" },
    { href: "/admin/testimonials", icon: Quote, label: "Testimonials" },
    { href: "/admin/site-content", icon: Settings, label: "Site Content" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/audit-log", icon: History, label: "Audit Log" },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="font-extrabold text-xl tracking-tighter">
          Trivinex<span className="text-primary">.Admin</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (location.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logout.isPending ? "Logging out…" : "Logout"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] flex bg-muted/10 selection:bg-primary/20">
      <aside className="w-72 border-r border-border/50 bg-card flex flex-col hidden lg:flex sticky top-0 h-screen shadow-sm">
        <SidebarContent />
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 lg:hidden">
          <span className="font-extrabold text-lg">Trivinex.Admin</span>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 flex flex-col">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
