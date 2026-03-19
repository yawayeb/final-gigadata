import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDataPackages } from "@/hooks/useDataPackages";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePaystackPayment } from "react-paystack";
import { supabase } from "@/lib/supabase";
import { triggerEmail } from "@/lib/email";
import { SystemNoticeBanner } from "@/components/SystemNoticeBanner";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicBottomNav } from "@/components/layout/PublicBottomNav";
import { GuestCheckoutModal } from "@/components/checkout/GuestCheckoutModal";
import {
  Wifi, Phone, ShoppingCart, CheckCircle2, ChevronDown,
  DollarSign, Gift, Users, Rocket, Star, ArrowRight,
  Zap, TrendingUp, Shield,
} from "lucide-react";

const NETWORKS = [
  { key: "at-ishare",  name: "AT iShare Business" },
  { key: "mtn-up2u",   name: "MTN UP2U Business" },
  { key: "at-bigtime", name: "AT Big Time Business" },
  { key: "telecel",    name: "Telecel Business" },
];

const AFFILIATE_BENEFITS = [
  {
    icon: Wifi,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "FREE 2GB Monthly",
    desc: "Every active affiliate receives 2GB of free data every single month for 12 months.",
  },
  {
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Earn ₵5 Per Referral",
    desc: "Refer anyone and earn ₵5 commission per successful signup. No cap, no limit.",
  },
  {
    icon: Gift,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Premium Services Access",
    desc: "AFA Registrations, WAEC Scratch Cards, Social Media Boosting — all at affiliate pricing.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create a free account", desc: "Sign up in under a minute. No documents needed." },
  { step: "02", title: "Subscribe for ₵150/year", desc: "Pay once and unlock all affiliate benefits for 12 months." },
  { step: "03", title: "Refer & Earn", desc: "Share your referral link and earn ₵5 for every person who joins." },
];

export default function LandingPage() {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const { session } = useAuth();
  const { profile } = useProfile();

  // ── Purchase flow state ──────────────────────────────────────────
  const [selectedNetwork,  setSelectedNetwork]  = useState<string | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [phoneNumber,      setPhoneNumber]      = useState("");
  const [guestModalOpen,   setGuestModalOpen]   = useState(false);
  const [paymentPending,   setPaymentPending]   = useState(false);
  const [guestUser, setGuestUser] = useState<{ id: string; email: string; full_name: string } | null>(null);
  const runAfterGuestRef = useRef(false);
  const panelRef  = useRef<HTMLDivElement>(null);
  const phoneRef  = useRef<HTMLDivElement>(null);
  const buyRef    = useRef<HTMLElement>(null);

  // ── Column count for row-aware accordion ─────────────────────────
  const [networkCols, setNetworkCols] = useState(4);
  useEffect(() => {
    const update = () => setNetworkCols(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Data + auth derivations ───────────────────────────────────────
  const { packages, loading } = useDataPackages(selectedNetwork ?? undefined);
  const bundle     = packages.find((b) => b.id === selectedBundleId);
  const isLoggedIn = !!session?.user;
  const email      = guestUser?.email || profile?.email || session?.user?.email || "";
  const userId     = guestUser?.id    || session?.user?.id;

  // ── Paystack config ───────────────────────────────────────────────
  const paystackConfig = {
    reference: `bundle_${Date.now()}`,
    email,
    amount:    (bundle?.price ?? 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "",
    currency:  "GHS",
    metadata: {
      custom_fields: [
        { display_name: "Phone Number", variable_name: "customer_phone", value: phoneNumber },
        { display_name: "Bundle Size",  variable_name: "bundle_size",   value: bundle?.size ?? "" },
        { display_name: "Validity",     variable_name: "validity",      value: bundle?.validity ?? "" },
      ],
    },
  };
  const initializePayment = usePaystackPayment(paystackConfig);

  // ── Payment handlers (unchanged logic) ───────────────────────────
  const onPaymentSuccess = async (ref: { reference: string }) => {
    if (!userId || !bundle) return;
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: userId, amount: bundle.price, type: "purchase", status: "success",
        description: `Purchased ${bundle.name} (${bundle.size}) for ${phoneNumber}`,
        reference: ref.reference,
      });
      if (error) throw error;
      const name = guestUser?.full_name || profile?.full_name || "Customer";
      await triggerEmail({ type: "purchase", email, name, amount: bundle.price, details: `${bundle.name} (${bundle.size}) for ${phoneNumber}` });
      toast({ title: "Payment successful!", description: `${bundle.size} sent to ${phoneNumber}.` });
      setSelectedBundleId(""); setPhoneNumber(""); setPaymentPending(false); setGuestUser(null); setSelectedNetwork(null);
      navigate("/order-confirmation", { state: { reference: ref.reference } });
    } catch (err: any) {
      toast({ title: "Transaction error", description: err.message, variant: "destructive" });
      setPaymentPending(false);
    }
  };

  const onPaymentClose = () => {
    setPaymentPending(false);
    toast({ title: "Payment cancelled", description: "The transaction was not completed.", variant: "destructive" });
  };

  const triggerPaystack = () => {
    if (!bundle || !phoneNumber.trim()) return;
    if (!email) { toast({ title: "Email required", description: "Please log in or continue as guest.", variant: "destructive" }); return; }
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) { toast({ title: "Config error", description: "Payment gateway not configured.", variant: "destructive" }); return; }
    setPaymentPending(true);
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  };

  const handleProceed = () => {
    if (!selectedBundleId || !phoneNumber.trim()) {
      toast({ title: "Missing info", description: "Select a bundle and enter a phone number.", variant: "destructive" }); return;
    }
    isLoggedIn ? triggerPaystack() : setGuestModalOpen(true);
  };

  const handleContinueAsGuest = async (guestEmail: string, fullName: string) => {
    const password = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { data, error } = await supabase.auth.signUp({ email: guestEmail, password, options: { data: { full_name: fullName } } });
    if (error) {
      let msg = error.message;
      if (msg.includes("already registered") || msg.includes("duplicate key") || msg.includes("Database error saving new user"))
        msg = "This email is already registered. Please sign in or use a different email.";
      toast({ title: "Could not continue as guest", description: msg, variant: "destructive" }); throw error;
    }
    if (data?.user) {
      setGuestUser({ id: data.user.id, email: data.user.email!, full_name: fullName });
      runAfterGuestRef.current = true;
      toast({ title: "Account created", description: "Proceeding to payment…" });
    }
  };

  useEffect(() => {
    if (!runAfterGuestRef.current || !guestUser || !bundle || !phoneNumber.trim()) return;
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) return;
    runAfterGuestRef.current = false;
    setPaymentPending(true);
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  }, [guestUser]);

  const handleNetworkClick = (key: string) => {
    if (selectedNetwork === key) { setSelectedNetwork(null); setSelectedBundleId(""); setPhoneNumber(""); }
    else {
      setSelectedNetwork(key); setSelectedBundleId(""); setPhoneNumber("");
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
    }
  };

  const handleBundleClick = (id: string) => {
    setSelectedBundleId(id); setPhoneNumber("");
    setTimeout(() => phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  };

  const networkRows: (typeof NETWORKS)[] = [];
  for (let i = 0; i < NETWORKS.length; i += networkCols) networkRows.push(NETWORKS.slice(i, i + networkCols));

  const scrollToBuy = () => {
    buyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 lg:pb-0">
      <SystemNoticeBanner />
      <PublicNav />

      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════════════
            HERO — Affiliate-first, conversion-focused
        ═══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-emerald-500/5 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          <div className="relative container mx-auto px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 animate-fade-in">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Ghana's Trusted Data Reseller Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-4 animate-fade-in">
              Earn Money &{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                Get Free Data
              </span>
              <br className="hidden sm:block" /> Every Month
            </h1>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 animate-fade-in">
              Join the GigaData Affiliate Program — earn <strong className="text-foreground">₵5 per referral</strong>,
              receive <strong className="text-foreground">2GB free data monthly</strong>, and resell bundles to
              anyone in Ghana. All for just ₵150/year.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-fade-in">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base font-bold gap-2 shadow-lg shadow-primary/25"
                onClick={() => navigate("/auth?tab=signup")}
              >
                <Rocket className="w-5 h-5" />
                Join Affiliate — ₵150/yr
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base font-semibold gap-2 border-2"
                onClick={scrollToBuy}
              >
                <Wifi className="w-5 h-5" />
                Buy Data Now
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Secure Paystack Payments
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                1,000+ Active Affiliates
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Instant Data Delivery
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 divide-x divide-border">
              {[
                { value: "1,000+", label: "Active Affiliates",    icon: Users },
                { value: "₵5",     label: "Earned Per Referral",  icon: TrendingUp },
                { value: "2GB",    label: "Free Data / Month",    icon: Wifi },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-5 px-3 text-center sm:text-left">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xl sm:text-2xl font-display font-bold text-foreground leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            AFFILIATE BENEFITS
        ═══════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-14 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
              Why Join the Affiliate Program?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One subscription, three powerful benefits. Start earning from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {AFFILIATE_BENEFITS.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing highlight */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-emerald-500 p-px">
            <div className="bg-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left flex-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Annual Affiliate Subscription</p>
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-5xl font-display font-bold text-foreground">₵150</span>
                  <span className="text-muted-foreground text-base">/year</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  That's just <strong className="text-foreground">₵12.50/month</strong> — pay for itself with only 2 referrals.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <Button
                  size="lg"
                  className="gap-2 font-bold px-8 shadow-lg shadow-primary/25"
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  <Rocket className="w-5 h-5" />
                  Join Now
                </Button>
                <Button
                  variant="outline" size="lg"
                  className="gap-2 font-semibold"
                  onClick={() => navigate("/affiliate-info")}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-muted/40 border-y border-border">
          <div className="container mx-auto px-4 py-14 sm:py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">Three simple steps to start earning.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  {/* connector line */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden sm:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border" />
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-display font-bold mb-4 shadow-lg shadow-primary/20 z-10">
                    {step}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <Button
                size="lg"
                className="gap-2 font-bold px-10 h-12 shadow-lg shadow-primary/25"
                onClick={() => navigate("/auth?tab=signup")}
              >
                <Rocket className="w-5 h-5" />
                Start Earning Today
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            BUY DATA — existing accordion logic, unchanged
        ═══════════════════════════════════════════════════════════ */}
        <section ref={buyRef} className="container mx-auto px-4 py-14 sm:py-20 scroll-mt-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
              Buy Data Bundles
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              All four major networks. Pick your network, choose a bundle, pay instantly.
            </p>
          </div>

          <div className="space-y-3">
            {networkRows.map((row, rowIdx) => {
              const rowHasOpen = row.some((n) => n.key === selectedNetwork);
              return (
                <div key={rowIdx}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {row.map((network) => {
                      const isOpen = selectedNetwork === network.key;
                      return (
                        <button
                          key={network.key}
                          type="button"
                          onClick={() => handleNetworkClick(network.key)}
                          className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 flex items-center gap-4 ${
                            isOpen ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-primary" : "bg-primary/20"}`}>
                            <Wifi className={`w-5 h-5 ${isOpen ? "text-primary-foreground" : "text-primary"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground block">{network.name}</span>
                            <span className="text-xs text-muted-foreground">{isOpen ? "Tap to close" : "Tap to view bundles"}</span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                        </button>
                      );
                    })}
                  </div>

                  {rowHasOpen && selectedNetwork && (
                    <div ref={panelRef} className="mt-3 bg-card border-2 border-primary/20 rounded-2xl p-4 sm:p-5 animate-fade-in">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Select a bundle
                      </p>

                      {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-xl border-2 border-border bg-muted h-20 animate-pulse" />
                          ))}
                        </div>
                      ) : packages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          No bundles available for this network right now.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {packages.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleBundleClick(p.id)}
                              className={`rounded-xl border-2 p-3 text-left transition-all duration-200 relative ${
                                selectedBundleId === p.id
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-border bg-background hover:border-primary/50"
                              }`}
                            >
                              {selectedBundleId === p.id && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary absolute top-2 right-2" />
                              )}
                              <p className="font-bold text-foreground text-sm">{p.size}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Valid {p.validity}</p>
                              <p className="text-base font-bold text-primary mt-1">GH¢{p.price}</p>
                            </button>
                          ))}
                        </div>
                      )}

                      {bundle && (
                        <div ref={phoneRef} className="mt-4 pt-4 border-t border-border animate-fade-in space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Enter beneficiary number
                          </p>

                          <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                            <div>
                              <p className="font-semibold text-foreground text-sm">{bundle.size}</p>
                              <p className="text-xs text-muted-foreground">Valid {bundle.validity}</p>
                            </div>
                            <p className="text-lg font-bold text-primary">GH¢{bundle.price}</p>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="landing-phone">Beneficiary phone number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="landing-phone"
                                type="tel"
                                placeholder="e.g. 0241234567"
                                className="pl-9 h-11"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                            </div>
                          </div>

                          <Button
                            size="lg"
                            className="w-full gap-2 font-semibold"
                            onClick={handleProceed}
                            disabled={!phoneNumber.trim() || paymentPending}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {paymentPending ? "Opening payment…" : `Pay GH¢${bundle.price}`}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FINAL CTA BANNER
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-gradient-to-r from-primary to-emerald-500 text-white">
          <div className="container mx-auto px-4 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              Ready to Earn? Join Today.
            </h2>
            <p className="text-white/80 max-w-md mx-auto mb-8">
              ₵150/year unlocks ₵5 per referral + 2GB free monthly data + premium service access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-white text-primary hover:bg-white/90 gap-2 shadow-xl"
                onClick={() => navigate("/auth?tab=signup")}
              >
                <Rocket className="w-5 h-5" />
                Join Affiliate Program
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base font-semibold border-2 border-white/50 text-white hover:bg-white/10 gap-2"
                onClick={scrollToBuy}
              >
                <Wifi className="w-5 h-5" />
                Buy Data Instead
              </Button>
            </div>
          </div>
        </section>

        {isLoggedIn && (
          <div className="container mx-auto px-4 py-6 text-center">
            <Button variant="outline" asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        )}

      </main>

      {/* Mobile sticky CTA bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden px-4 pb-2 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <Button
            size="lg"
            className="flex-1 gap-1.5 font-bold shadow-xl shadow-primary/30 text-sm"
            onClick={() => navigate("/auth?tab=signup")}
          >
            <Rocket className="w-4 h-4" />
            Join Affiliate
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 gap-1.5 font-semibold bg-background shadow-xl text-sm border-2"
            onClick={scrollToBuy}
          >
            <Wifi className="w-4 h-4" />
            Buy Data
          </Button>
        </div>
      </div>

      <PublicBottomNav />

      <GuestCheckoutModal
        open={guestModalOpen}
        onOpenChange={setGuestModalOpen}
        onContinueAsGuest={handleContinueAsGuest}
        isLoading={paymentPending}
      />
    </div>
  );
}
