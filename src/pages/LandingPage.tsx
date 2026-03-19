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
import { Wifi, Phone, ShoppingCart, CheckCircle2 } from "lucide-react";

const SERVICE_NAMES: Record<string, string> = {
  "at-ishare": "AT iShare Business",
  "mtn-up2u": "MTN UP2U Business",
  "at-bigtime": "AT Big Time Business",
  "telecel": "Telecel Business",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const { profile } = useProfile();
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [guestUserAfterSignup, setGuestUserAfterSignup] = useState<{ id: string; email: string; full_name: string } | null>(null);
  const runPaymentAfterGuestRef = useRef(false);
  const bundleSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { packages, loading } = useDataPackages(selectedNetwork || undefined);
  const bundle = packages.find((b) => b.id === selectedBundleId);
  const isLoggedIn = !!session?.user;
  const emailForPayment = guestUserAfterSignup?.email || profile?.email || session?.user?.email || "";
  const userIdForPayment = guestUserAfterSignup?.id || session?.user?.id;

  const paystackConfig = {
    reference: `bundle_${Date.now()}`,
    email: emailForPayment,
    amount: (bundle?.price || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
    metadata: {
      custom_fields: [
        { display_name: "Customer Email", variable_name: "customer_email", value: emailForPayment },
        { display_name: "Phone Number", variable_name: "customer_phone", value: phoneNumber },
        { display_name: "Product", variable_name: "product", value: bundle?.name || "" },
        { display_name: "Bundle Size", variable_name: "bundle_size", value: bundle?.size || "" },
        { display_name: "Validity", variable_name: "validity", value: bundle?.validity || "" },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onPaymentSuccess = async (reference: { reference: string }) => {
    const userId = userIdForPayment;
    if (!userId || !bundle) return;
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        amount: bundle.price,
        type: "purchase",
        status: "success",
        description: `Purchased ${bundle.name} (${bundle.size}) for ${phoneNumber}`,
        reference: reference.reference,
      });
      if (error) throw error;
      const name = guestUserAfterSignup?.full_name || profile?.full_name || session?.user?.user_metadata?.full_name || "Customer";
      await triggerEmail({
        type: "purchase",
        email: emailForPayment,
        name,
        amount: bundle.price,
        details: `${bundle.name} (${bundle.size}) for ${phoneNumber}`,
      });
      toast({
        title: "Payment successful!",
        description: `${bundle.size} data bundle for ${phoneNumber} has been ordered.`,
      });
      setSelectedBundleId("");
      setPhoneNumber("");
      setPaymentPending(false);
      setGuestUserAfterSignup(null);
      navigate("/order-confirmation", { state: { reference: reference.reference } });
    } catch (err: any) {
      toast({ title: "Transaction error", description: err.message, variant: "destructive" });
      setPaymentPending(false);
    }
  };

  const onPaymentClose = () => {
    setPaymentPending(false);
    toast({ title: "Payment cancelled", description: "The transaction was not completed.", variant: "destructive" });
  };

  const runPayment = () => {
    if (!bundle || !phoneNumber) return;
    if (!emailForPayment) {
      toast({ title: "Email required", description: "Please complete the step above.", variant: "destructive" });
      return;
    }
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      toast({ title: "Configuration error", description: "Paystack is not configured.", variant: "destructive" });
      return;
    }
    setPaymentPending(true);
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  };

  const handleProceedToPayment = () => {
    if (!selectedNetwork || !selectedBundleId || !phoneNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a network, bundle, and enter a phone number.",
        variant: "destructive",
      });
      return;
    }
    if (isLoggedIn) {
      runPayment();
    } else {
      setGuestModalOpen(true);
    }
  };

  const handleContinueAsGuest = async (email: string, fullName: string) => {
    const password = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      let msg = error.message;
      if (
        msg.includes("23505") ||
        msg.includes("duplicate key") ||
        msg.includes("users_email_partial_key") ||
        msg.includes("already registered") ||
        msg.includes("Database error saving new user")
      ) {
        msg = "This email is already registered. Please sign in or use a different email.";
      }
      toast({ title: "Could not continue as guest", description: msg, variant: "destructive" });
      throw error;
    }
    if (data?.user) {
      setGuestUserAfterSignup({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      });
      runPaymentAfterGuestRef.current = true;
      toast({ title: "Account created", description: "Proceeding to payment…" });
    }
  };

  useEffect(() => {
    if (!runPaymentAfterGuestRef.current || !guestUserAfterSignup || !bundle || !phoneNumber.trim()) return;
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) return;
    runPaymentAfterGuestRef.current = false;
    setPaymentPending(true);
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  }, [guestUserAfterSignup]);

  // Scroll to bundle section when network is selected
  const handleNetworkSelect = (key: string) => {
    setSelectedNetwork(key);
    setSelectedBundleId("");
    setPhoneNumber("");
    setTimeout(() => {
      bundleSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Scroll to form when bundle is selected
  const handleBundleSelect = (id: string) => {
    setSelectedBundleId(id);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 lg:pb-0">
      <SystemNoticeBanner />
      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <section className="text-center mb-10 sm:mb-14 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Buy Data Bundles in Ghana
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your network, pick a bundle, and pay with Mobile Money. No login required to browse.
          </p>
        </section>

        {/* Step 1 — Network selection */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">1</span>
            <h2 className="text-xl font-display font-semibold text-foreground">Select network</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(SERVICE_NAMES) as [string, string][]).map(([key, name]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleNetworkSelect(key)}
                className={`rounded-2xl border-2 p-6 text-left transition-all duration-200 flex items-center gap-4 ${
                  selectedNetwork === key
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-card"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-foreground block">{name}</span>
                  {selectedNetwork === key && (
                    <span className="text-xs text-primary font-medium">Selected</span>
                  )}
                </div>
                {selectedNetwork === key && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 — Bundle cards */}
        {selectedNetwork && (
          <section ref={bundleSectionRef} className="mb-8 animate-fade-in scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">2</span>
              <h2 className="text-xl font-display font-semibold text-foreground">
                Select a bundle — <span className="text-primary">{SERVICE_NAMES[selectedNetwork]}</span>
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl border-2 border-border bg-card p-4 h-28 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {packages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleBundleSelect(p.id)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 relative ${
                      selectedBundleId === p.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-card"
                    }`}
                  >
                    {selectedBundleId === p.id && (
                      <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2" />
                    )}
                    <p className="font-bold text-foreground text-base">{p.size}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">Valid {p.validity}</p>
                    <p className="text-lg font-display font-bold text-primary">GH¢{p.price}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3 — Phone + Pay (appears under the bundle grid when a bundle is selected) */}
            {bundle && (
              <div ref={formRef} className="mt-5 animate-fade-in scroll-mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">3</span>
                  <h2 className="text-xl font-display font-semibold text-foreground">Enter beneficiary number</h2>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4 max-w-lg">
                  {/* Selected bundle summary */}
                  <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    <div>
                      <p className="font-semibold text-foreground">{bundle.size}</p>
                      <p className="text-sm text-muted-foreground">Valid {bundle.validity}</p>
                    </div>
                    <p className="text-xl font-display font-bold text-primary">GH¢{bundle.price}</p>
                  </div>

                  {/* Phone number */}
                  <div className="space-y-2">
                    <Label htmlFor="landing-phone">Recipient phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="landing-phone"
                        type="tel"
                        placeholder="e.g. 0241234567"
                        className="pl-10 h-12"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full gap-2 font-semibold"
                    onClick={handleProceedToPayment}
                    disabled={loading || !bundle || !phoneNumber.trim() || paymentPending}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {paymentPending ? "Opening payment…" : "Proceed to payment"}
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* CTA for logged-in users */}
        {isLoggedIn && (
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        )}
      </main>

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
