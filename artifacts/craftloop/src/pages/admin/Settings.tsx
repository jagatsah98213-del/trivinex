import { useState, useEffect } from "react";
import {
  useLogout, useGetCurrentUser,
} from "@workspace/api-client-react";
import { LogOut, Mail, Phone, MessageCircle, Globe, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";

const SETTING_KEYS = [
  { key: "contact_email", label: "Contact Email", icon: Mail, type: "email" as const },
  { key: "contact_phone", label: "Contact Phone", icon: Phone, type: "tel" as const },
  { key: "contact_whatsapp", label: "WhatsApp", icon: MessageCircle, type: "tel" as const },
  { key: "site_title", label: "Site Title", icon: Globe, type: "text" as const },
  { key: "site_tagline", label: "Site Tagline", icon: Globe, type: "text" as const },
];

export default function AdminSettings() {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("https://trivinex.onrender.com/api/public/site-settings");
      const data = await res.json();
      setSettings(data);
    } catch {
      toast({ variant: "destructive", title: "Failed to load settings" });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (isLoading) return <div className="py-8">Loading…</div>;
  if (!user || user.role !== "ADMIN") return null;

  const saveSetting = async (key: string) => {
    const value = settings[key];
    if (value === undefined) return;
    const token = document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN="))?.split("=")[1] || "";
    setSaving({ ...saving, [key]: true });
    try {
      const res = await fetch(`/api/admin/site-settings/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
        body: JSON.stringify({ value }),
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Setting updated" });
      } else {
        toast({ variant: "destructive", title: "Failed to update setting" });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to update setting" });
    } finally {
      setSaving({ ...saving, [key]: false });
    }
  };

  const testEmailConfig = async () => {
    if (!testEmail) return;
    try {
      const res = await fetch("https://trivinex.onrender.com/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
        credentials: "include",
      });
      const result = await res.json();
      setEmailTestResult(result);
      if (result.success) toast({ title: "Test email sent" });
      else toast({ variant: "destructive", title: "Test email failed", description: result.error });
    } catch {
      toast({ variant: "destructive", title: "Test email failed" });
    }
  };

  const verifyConfig = async () => {
    try {
      const res = await fetch("https://trivinex.onrender.com/api/admin/email/test", { credentials: "include" });
      const result = await res.json();
      setEmailTestResult(result);
    } catch {
      setEmailTestResult({ success: false, error: "Unable to verify" });
    }
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Settings — Admin" canonical="/admin/settings" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Settings</h1>
          <p className="text-[#6E6E73] text-sm">
            Manage website contact details and verify integrations.
          </p>
        </div>
        <Button variant="outline" onClick={() => {
          logout.mutate(undefined, { onSuccess: () => { window.location.href = "/admin/login"; } });
        }}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Contact &amp; Branding</CardTitle>
          <CardDescription>
            Update public contact information shown in the header and footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SETTING_KEYS.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <setting.icon className="w-5 h-5 text-[#6E6E73]" />
                <Label className="font-medium text-[#1D1D1F]">{setting.label}</Label>
              </div>
              <Input
                value={settings[setting.key] ?? ""}
                onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                type={setting.type}
                disabled={saving[setting.key]}
                className="w-80"
              />
              {saving[setting.key] ? (
                <span className="text-xs text-[#6E6E73]">Saving…</span>
              ) : (
                <Button size="icon" onClick={() => saveSetting(setting.key)}>
                  <Send className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Integration</CardTitle>
          <CardDescription>
            Send a test email to verify your Gmail SMTP configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1"
            />
            <Button onClick={testEmailConfig} disabled={!testEmail}>
              Send Test Email
            </Button>
          </div>
          {emailTestResult && (
            <div className={`p-3 rounded-lg text-sm ${
              emailTestResult.success ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
            }`}>
              {emailTestResult.success ? "✅ Test email sent successfully" : `❌ ${emailTestResult.error}`}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={verifyConfig}>
            Verify SMTP Configuration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Admin account and session settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6E6E73]">
            Admin access is cookie-based with CSRF protection. No public registration is available.
            First admin is bootstrapped via ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD environment variables.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
