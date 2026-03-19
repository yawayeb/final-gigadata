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
import { Wifi, Phone, ShoppingCart, CheckCircle2, ChevronDown } from "lucide-react";

const NETWORKS = [
  { key: "at-ishare", name: "AT iShare Business" },
  { key: "mtn-up2u", name: "MTN UP2U Business" },
  { key: "at-bigtime", name: "AT Big Time Business" },
  { key: "telecel", name: "Telecel Business" },
];

// Inner panel that loads bundles for a selected network
function BundlePanel({
  networkKey,
  onPayment,
  paymentPending,
}: {
  networkKey: string;
  onPayment: (bundleId: string, phone: string) => void;
  paymentPending: boolean;
}) {
  const { packages, loading } = useDataPackages(networkKey);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const bundle = packages.find((b) => b.id === selectedBundleId);
  const phoneRef = useRef<HTMLDivElement>(null);

  const handleBundleClick = (id: string) => {
    setSelectedBundleId(id);
    setTimeout(() => {
      phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 sm:p-5 animate-fade-in">
      {/* Bundle grid */}
      <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Select a bundle
      </p>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border-2 border-border bg-muted h-20 animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No bundles available for this network.</p>
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

      {/* Phone + Pay — shows after bundle selection */}
      {bundle && (
        <div ref={phoneRef} className="mt-4 pt-4 border-t border-border animate-fade-in">
          {/* Bundle summary */}
          <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 mb-4">
            <div>
              <p className="font-semibold text-foreground text-sm">{bundle.size}</p>
              <p className="text-xs text-muted-foreground">Valid {bundle.validity}</p>
            </div>
            <p className="text-lg font-bold text-primary">GH¢{bundle.price}</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="landing-phone" className="text-sm">Beneficiary phone number</Label>
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
              onClick={() => onPayment(bundle.id, phoneNumber)}
              disabled={!phoneNumber.trim() || paymentPending}
            >
              <ShoppingCart className="w-4 h-4" />
              {paymentPending ? "Opening payment…" : `Pay GH¢${bundle.price}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const { profile } = useProfile();
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [pendingBundleId, setPendingBundleId] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [guestUserAfterSignup, setGuestUserAfterSignup] = useState<{ id: string; email: string; full_name: string } | null>(null);
  const runPaymentAfterGuestRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [networkCols, setNetworkCols] = useState(4);

  // Track column count for row-splitting
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setNetworkCols(4);
      else if (window.innerWidth >= 640) setNetworkCols(2);
      else setNetworkCols(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isLoggedIn = !!session?.user;
  const emailForPayment = guestUserAfterSignup?.email || profile?.email || session?.user?.email || "";
  const userIdForPayment = guestUserAfterSignup?.id || session?.user?.id;

  // We need the bundle data for payment — fetch packages for selected network
  const { packages } = useDataPackages(selectedNetwork || undefined);
  const bundle = packages.find((b) => b.id === pendingBundleId);

  const paystackConfig = {
    reference: `bundle_${Date.now()}`,
    email: emailForPayment,
    amount: (bundle?.price || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
    metadata: {
      custom_fields: [
        { display_name: "Customer Email", variable_name: "customer_email", value: emailForPayment },
        { display_name: "Phone Number", variable_name: "customer_phone", value: pendingPhone },
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
        description: `Purchased ${bundle.name} (${bundle.size}) for ${pendingPhone}`,
        reference: reference.reference,
      });
      if (error) throw error;
      const name = guestUserAfterSignup?.full_name || profile?.full_name || session?.user?.user_metadata?.full_name || "Customer";
      await triggerEmail({
        type: "purchase",
        email: emailForPayment,
        name,
        amount: bundle.price,
        details: `${bundle.name} (${bundle.size}) for ${pendingPhone}`,
      });
      toast({
        title: "Payment successful!",
        description: `${bundle.size} data bundle for ${pendingPhone} has been ordered.`,
      });
      setPendingBundleId("");
      setPendingPhone("");
      setPaymentPending(false);
      setGuestUserAfterSignup(null);
      setSelectedNetwork(null);
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
    if (!bundle || !pendingPhone) return;
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

  const handlePayment = (bundleId: string, phone: string) => {
    if (!selectedNetwork || !bundleId || !phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a bundle and enter a phone number.",
        variant: "destructive",
      });
      return;
    }
    setPendingBundleId(bundleId);
    setPendingPhone(phone);
    if (isLoggedIn) {
      // Will trigger payment after state updates
      setPaymentPending(true);
    } else {
      setGuestModalOpen(true);
    }
  };

  // Run payment once pendingBundleId & pendingPhone are set and user is logged in
  useEffect(() => {
    if (!paymentPending || !pendingBundleId || !pendingPhone || !bundle || !emailForPayment) return;
    if (!isLoggedIn && !guestUserAfterSignup) return;
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) return;
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  }, [paymentPending, bundle, emailForPayment]);

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
    if (!runPaymentAfterGuestRef.current || !guestUserAfterSignup || !bundle || !pendingPhone.trim()) return;
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) return;
    runPaymentAfterGuestRef.current = false;
    setPaymentPending(true);
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  }, [guestUserAfterSignup]);

  const handleNetworkSelect = (key: string) => {
    if (selectedNetwork === key) {
      setSelectedNetwork(null);
      return;
    }
    setSelectedNetwork(key);
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 150);
  };

  // Split network list into rows for inline accordion
  const networkRows: (typeof NETWORKS)[] = [];
  for (let i = 0; i < NETWORKS.length; i += networkCols) {
    networkRows.push(NETWORKS.slice(i, i + networkCols));
  }

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
            Choose your network, pick a bundle, and pay with Mobile Money. No login required.
          </p>
        </section>

        {/* Step 1 — Network selection with inline accordion */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">1</span>
            <h2 className="text-xl font-display font-semibold text-foreground">Select your network</h2>
          </div>

          <div className="space-y-3">
            {networkRows.map((row, rowIdx) => {
              const rowHasSelected = row.some((n) => n.key === selectedNetwork);
              return (
                <div key={rowIdx}>
                  {/* Network cards for this row */}
                  <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`}>
                    {row.map((network) => {
                      const isSelected = selectedNetwork === network.key;
                      return (
                        <button
                          key={network.key}
                          type="button"
                          onClick={() => handleNetworkSelect(network.key)}
                          className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 flex items-center gap-4 ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary" : "bg-primary/20"}`}>
                            <Wifi className={`w-5 h-5 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground block text-sm sm:text-base">{network.name}</span>
                            <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                              {isSelected ? "Tap to close" : "Tap to view bundles"}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isSelected ? "rotate-180 text-primary" : ""}`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Accordion panel — drops right under the row containing the selected card */}
                  {rowHasSelected && selectedNetwork && (
                    <div ref={panelRef} className="mt-3">
                      <BundlePanel
                        key={selectedNetwork}
                        networkKey={selectedNetwork}
                        onPayment={handlePayment}
                        paymentPending={paymentPending}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

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
