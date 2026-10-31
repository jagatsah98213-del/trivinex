import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useGetCurrentUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function Login({ type }: { type: "admin" }) {
  const [, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser();
  const login = useLogin();
  const { toast } = useToast();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === "ADMIN" && type === "admin") {
      setLocation("/admin");
    }
  }, [user, type, setLocation]);

  const fetchCsrfToken = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/csrf-token", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      }
    } catch {
      // CSRF token fetch is non-critical
    }
  }, []);

  useEffect(() => {
    if (user) fetchCsrfToken();
  }, [user, fetchCsrfToken]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login.mutate({ data: values }, {
      onSuccess: (u) => {
        if (type === "admin" && u.role !== "ADMIN") {
          toast({ variant: "destructive", title: "Unauthorized", description: "Not an admin account." });
          return;
        }
        setLocation("/admin");
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: (err.data as any)?.message || err.message || "Please check your credentials and try again.",
        });
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]/20 p-4 font-sans selection:bg-primary/20">
      <Card className="w-full max-w-md shadow-2xl border-border/50 rounded-3xl animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-2 pb-8 pt-8 px-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-center">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-center text-base font-medium">
            Sign in to manage Trivenix Partners
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground/80">Email Address</FormLabel>
                    <FormControl>
                      <Input className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground/80">Password</FormLabel>
                    <FormControl>
                      <Input className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold mt-8 shadow-lg shadow-primary/20" disabled={login.isPending}>
                {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in securely"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
