import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Layout, Lock, Mail, User, UserPlus, CheckCircle } from "lucide-react";
import { SystemNoticeBanner } from "@/components/SystemNoticeBanner";
import { PublicNav } from "@/components/layout/PublicNav";
import { triggerEmail } from "@/lib/email";

const AUTH_BENEFITS = [
  "Faster checkout",
  "Saved phone numbers",
  "Order history",
  "Access to affiliate dashboard",
];

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "login";
  const validTab = ["login", "signup", "forgot"].includes(tabFromUrl) ? tabFromUrl : "login";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
      navigate("/dashboard");
    } catch (err: any) {
      let msg = err.message;
      if (msg === "Failed to fetch" || msg.includes("URL")) {
        msg = "Database connection failed. Check your .env configuration.";
      }
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const getReferrerId = async (code: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", code.trim())
      .single();
    if (error || !data) return null;
    return data.id;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            referred_by: referralCode ? await getReferrerId(referralCode) : null,
          },
        },
      });
      if (error) throw error;
      await triggerEmail({ type: "signup", email: signupEmail, name: signupName });
      toast({
        title: "Account created!",
        description: "Check your email for the confirmation link.",
      });
      setSearchParams({ tab: "login" });
    } catch (err: any) {
      let msg = err?.message || "Something went wrong.";
      if (msg === "Failed to fetch" || msg.includes("URL")) {
        msg = "Database connection failed. Check your .env configuration.";
      } else if (
        msg.includes("23505") ||
        msg.includes("duplicate key") ||
        msg.includes("users_email_partial_key") ||
        msg.includes("already registered")
      ) {
        msg = "An account with this email already exists. Please sign in or use a different email.";
      } else if (msg.includes("Database error saving new user")) {
        msg = "This email is already registered. Please sign in or use a different email.";
      }
      toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotSent(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/auth?tab=login`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast({
        title: "Check your email",
        description: "We sent a link to reset your password.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <SystemNoticeBanner />
      <PublicNav />
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-primary/15 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-accent/15 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Layout className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Account</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in or create an account</p>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-elevated">
            <Tabs value={validTab} onValueChange={(v) => handleTabChange(v)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
                <TabsTrigger value="forgot">Forgot</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-9 h-11"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs h-auto p-0"
                        onClick={() => handleTabChange("forgot")}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 h-11"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="default" size="lg" className="w-full" disabled={loginLoading}>
                    {loginLoading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-9 h-11"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-9 h-11"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 h-11"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-referral">Referral Code (optional)</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-referral"
                        type="text"
                        placeholder="EDUHUB-XXXXXX"
                        className="pl-9 h-11"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="default" size="lg" className="w-full" disabled={signupLoading}>
                    {signupLoading ? "Creating account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                {forgotSent ? (
                  <div className="text-center py-4 space-y-2">
                    <CheckCircle className="w-12 h-12 text-accent mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      If an account exists for that email, we sent a password reset link.
                    </p>
                    <Button type="button" variant="outline" onClick={() => handleTabChange("login")}>
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-9 h-11"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="default" size="lg" className="w-full" disabled={forgotLoading}>
                      {forgotLoading ? "Sending…" : "Send reset link"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => handleTabChange("login")}
                    >
                      Back to Login
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 rounded-xl bg-muted/50 border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Benefits of an account
            </p>
            <ul className="text-sm text-foreground space-y-1">
              {AUTH_BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
