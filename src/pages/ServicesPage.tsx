import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDataPackages } from "@/hooks/useDataPackages";

import { usePaystackPayment } from "react-paystack";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

import { triggerEmail } from "@/lib/email";

const serviceNames: Record<string, string> = {
  "at-ishare": "AT iShare Business",
  "mtn-up2u": "MTN UP2U Business",
  "at-bigtime": "AT Big Time Business",
  "telecel": "Telecel Business",
};

const ServicesPage = () => {
  const { service } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [selectedBundle, setSelectedBundle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // AFA Registration form state
  const [showAfaForm, setShowAfaForm] = useState(false);
  const [afaForm, setAfaForm] = useState({
    phone: "",
    fullName: "",
    ghanaCard: "",
    dob: "",
    location: "",
  });
  const [afaProcessing, setAfaProcessing] = useState(false);

  const { packages, loading } = useDataPackages(service);
  const serviceName = service ? serviceNames[service] || "Data Services" : "Data Services";

  const bundle = packages.find((b) => b.id === selectedBundle);

  const config = {
    reference: `bundle_${new Date().getTime()}`,
    email: profile?.email || "",
    amount: (bundle?.price || 0) * 100, // Paystack amount is in pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Email",
          variable_name: "customer_email",
          value: profile?.email || "",
        },
        {
          display_name: "Phone Number",
          variable_name: "customer_phone",
          value: phoneNumber,
        },
        {
          display_name: "Product",
          variable_name: "product",
          value: bundle?.name || "",
        },
        {
          display_name: "Bundle Size",
          variable_name: "bundle_size",
          value: bundle?.size || "",
        },
        {
          display_name: "Validity",
          variable_name: "validity",
          value: bundle?.validity || "",
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  // ── AFA Paystack config (created with a fixed reference seed; price varies by affiliate status) ──
  const isActiveAffiliateGlobal =
    !!profile?.is_affiliate &&
    (!profile?.affiliate_expires_at ||
      new Date(profile.affiliate_expires_at) > new Date());
  const afaPrice = isActiveAffiliateGlobal ? 25 : 40;

  const afaConfig = {
    reference: `afa_${new Date().getTime()}`,
    email: profile?.email || "",
    amount: afaPrice * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
    metadata: {
      custom_fields: [
        { display_name: "Service", variable_name: "service", value: "MTN AFA Registration" },
        { display_name: "Customer Name", variable_name: "customer_name", value: afaForm.fullName },
        { display_name: "Phone", variable_name: "phone", value: afaForm.phone },
        { display_name: "Ghana Card", variable_name: "ghana_card", value: afaForm.ghanaCard },
        { display_name: "Date of Birth", variable_name: "dob", value: afaForm.dob },
        { display_name: "Location", variable_name: "location", value: afaForm.location },
      ],
    },
  };

  const initializeAfaPayment = usePaystackPayment(afaConfig);

  const onAfaSuccess = async (reference: any) => {
    setAfaProcessing(true);
    try {
      if (!profile) return;
      const { error } = await supabase.from('transactions').insert({
        user_id: profile.id,
        amount: afaPrice,
        type: 'purchase',
        status: 'success',
        description: `MTN AFA Registration – ${afaForm.fullName} | ${afaForm.phone} | Ghana Card: ${afaForm.ghanaCard} | DOB: ${afaForm.dob} | Location: ${afaForm.location}`,
        reference: reference.reference,
      });
      if (error) throw error;

      await triggerEmail({
        type: 'purchase',
        email: profile.email,
        name: profile.full_name,
        amount: afaPrice,
        details: `MTN AFA Registration for ${afaForm.fullName} (${afaForm.phone})`,
      });

      toast({
        title: "AFA Registration Successful! 🎉",
        description: `Your MTN AFA registration has been submitted. We'll process it shortly.`,
      });
      setAfaForm({ phone: "", fullName: "", ghanaCard: "", dob: "", location: "" });
      setShowAfaForm(false);
      // Navigate to confirmation page
      navigate("/order-confirmation", { state: { reference: reference.reference } });
    } catch (err: any) {
      toast({ title: "Transaction Error", description: err.message, variant: "destructive" });
    } finally {
      setAfaProcessing(false);
    }
  };

  const onAfaClose = () => {
    toast({ title: "Payment Cancelled", description: "AFA registration was not completed.", variant: "destructive" });
  };

  const handleAfaSubmit = () => {
    const { phone, fullName, ghanaCard, dob, location } = afaForm;
    if (!phone || !fullName || !ghanaCard || !dob || !location) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!profile?.email) {
      toast({ title: "Profile Loading", description: "Please wait for your profile to load.", variant: "destructive" });
      return;
    }
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      toast({ title: "Configuration Error", description: "Paystack Public Key is missing.", variant: "destructive" });
      return;
    }
    initializeAfaPayment({ onSuccess: onAfaSuccess, onClose: onAfaClose });
  };

  const onSuccess = async (reference: any) => {
    try {
      if (!profile || !bundle) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          amount: bundle.price,
          type: 'purchase',
          status: 'success',
          description: `Purchased ${bundle.name} (${bundle.size}) for ${phoneNumber}`,
          reference: reference.reference
        });

      if (error) throw error;

      // Trigger Purchase Email
      await triggerEmail({
        type: 'purchase',
        email: profile.email,
        name: profile.full_name,
        amount: bundle.price,
        details: `${bundle.name} (${bundle.size}) for ${phoneNumber}`
      });

      toast({
        title: "Payment Successful!",
        description: `${bundle.size} data bundle for ${phoneNumber} has been ordered.`,
      });

      setSelectedBundle("");
      setPhoneNumber("");
      // Navigate to confirmation page
      navigate("/order-confirmation", { state: { reference: reference.reference } });
    } catch (error: any) {
      toast({
        title: "Transaction Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "The transaction was not completed.",
      variant: "destructive",
    });
  };

  const handlePurchase = () => {
    if (!profile?.email) {
      toast({
        title: "Profile Loading",
        description: "Please wait for your profile to load.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBundle || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please select a bundle and enter a phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      toast({
        title: "Configuration Error",
        description: "Paystack Public Key is missing in .env file.",
        variant: "destructive",
      });
      return;
    }

    initializePayment({ onSuccess, onClose });
  };

  if (!service) {
    // Determine if user is an active affiliate (not expired)
    const isActiveAffiliate =
      !!profile?.is_affiliate &&
      (!profile?.affiliate_expires_at ||
        new Date(profile.affiliate_expires_at) > new Date());

    const afaPrice = isActiveAffiliate ? 25 : 40;

    return (
      <div className="space-y-10">
        {/* ── Data Services ── */}
        <div>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Data Services
            </h1>
            <p className="text-muted-foreground">
              Select a network provider to view available bundles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(serviceNames).map(([key, name], index) => (
              <a
                key={key}
                href={`/services/${key}`}
                className="bg-card rounded-2xl shadow-card p-6 text-center hover:shadow-elevated transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl gradient-purple mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-card-foreground">
                  {name}
                </h3>
              </a>
            ))}
          </div>
        </div>

        {/* ── Premium Services ── */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">
              ⭐ Premium Services
            </h2>
            <p className="text-sm text-muted-foreground">
              Exclusive services available to all users — with special affiliate pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* MTN AFA Registration */}
            <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in hover:shadow-elevated transition-shadow flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-card-foreground leading-tight">
                    MTN AFA Registration
                  </h3>
                  <p className="text-xs text-muted-foreground">Official registration service</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-4 flex-1">
                {isActiveAffiliate ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-primary">₵25.00</span>
                    <span className="text-sm line-through text-muted-foreground">₵40.00</span>
                    <span className="ml-auto text-xs bg-green-500/10 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                      Affiliate Price
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-display font-bold text-foreground">₵40.00</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                      Affiliates pay only
                      <span className="font-bold text-primary">₵25.00</span>
                    </div>
                  </div>
                )}
              </div>


              {/* Register Now button — toggles inline form */}
              {!showAfaForm ? (
                <button
                  onClick={() => setShowAfaForm(true)}
                  className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Register Now
                </button>
              ) : (
                <div className="mt-2 space-y-3 animate-fade-in">
                  <div className="border-t border-border pt-3 mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Fill in your details to proceed to payment
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="afa-phone" className="text-xs">Phone Number *</Label>
                    <Input
                      id="afa-phone"
                      type="tel"
                      placeholder="e.g. 0241234567"
                      value={afaForm.phone}
                      onChange={(e) => setAfaForm({ ...afaForm, phone: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="afa-name" className="text-xs">Customer Full Name *</Label>
                    <Input
                      id="afa-name"
                      type="text"
                      placeholder="e.g. Kofi Mensah"
                      value={afaForm.fullName}
                      onChange={(e) => setAfaForm({ ...afaForm, fullName: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  {/* Ghana Card ID */}
                  <div>
                    <Label htmlFor="afa-card" className="text-xs">Ghana Card ID *</Label>
                    <Input
                      id="afa-card"
                      type="text"
                      placeholder="e.g. GHA-123456789-0"
                      value={afaForm.ghanaCard}
                      onChange={(e) => setAfaForm({ ...afaForm, ghanaCard: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Label htmlFor="afa-dob" className="text-xs">Date of Birth *</Label>
                    <Input
                      id="afa-dob"
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={afaForm.dob}
                      onChange={(e) => setAfaForm({ ...afaForm, dob: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="afa-location" className="text-xs">Location (Town) *</Label>
                    <Input
                      id="afa-location"
                      type="text"
                      placeholder="e.g. Accra, Kumasi"
                      value={afaForm.location}
                      onChange={(e) => setAfaForm({ ...afaForm, location: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  {/* Order summary */}
                  <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg text-sm">
                    <span className="text-muted-foreground">Total to Pay</span>
                    <span className="font-bold text-primary">
                      ₵{isActiveAffiliate ? "25.00" : "40.00"}
                      {isActiveAffiliate && (
                        <span className="ml-1 text-xs font-normal text-green-600">(Affiliate)</span>
                      )}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={handleAfaSubmit}
                    disabled={afaProcessing}
                  >
                    {afaProcessing ? "Processing…" : `Pay ₵${isActiveAffiliate ? "25" : "40"} & Register`}
                  </Button>
                  <button
                    onClick={() => { setShowAfaForm(false); setAfaForm({ phone: "", fullName: "", ghanaCard: "", dob: "", location: "" }); }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {!isActiveAffiliate && !showAfaForm && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  <a href="/affiliate" className="text-primary underline underline-offset-2">
                    Join the Affiliate Program
                  </a>{" "}
                  to get the ₵25 price
                </p>
              )}
            </div>


            {/* WAEC Scratch Cards */}
            <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in hover:shadow-elevated transition-shadow flex flex-col" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-card-foreground leading-tight">
                    WAEC Scratch Cards
                  </h3>
                  <p className="text-xs text-muted-foreground">Check results online</p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center py-4">
                <span className="text-sm text-muted-foreground italic">Pricing coming soon…</span>
              </div>
              <button disabled className="w-full bg-muted text-muted-foreground font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            {/* Social Media Boosting */}
            <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in hover:shadow-elevated transition-shadow flex flex-col" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-card-foreground leading-tight">
                    Social Media Boosting
                  </h3>
                  <p className="text-xs text-muted-foreground">TikTok, Facebook, Instagram</p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center py-4">
                <span className="text-sm text-muted-foreground italic">Pricing coming soon…</span>
              </div>
              <button disabled className="w-full bg-muted text-muted-foreground font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                Coming Soon
              </button>
            </div>

          </div>

          {/* Affiliate pricing note */}
          {!isActiveAffiliate && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/15">
              <span className="text-xl">💡</span>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Save on every service.</span>{" "}
                <a href="/affiliate" className="text-primary underline underline-offset-2 font-semibold">
                  Subscribe to the Affiliate Program (₵150/year)
                </a>{" "}
                to unlock exclusive member pricing across all Premium Services.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          {serviceName}
        </h1>
        <p className="text-muted-foreground">
          Select a bundle and enter recipient's phone number
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
        <div className="space-y-6">
          <div>
            <Label htmlFor="bundle">Select Bundle</Label>
            <Select value={selectedBundle} onValueChange={setSelectedBundle}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={loading ? "Loading packages..." : "Choose a data bundle"} />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {packages.map((bundle) => (
                  <SelectItem key={bundle.id} value={bundle.id}>
                    <div className="flex justify-between items-center w-full gap-4">
                      <span>{bundle.name}</span>
                      <span className="text-primary font-semibold">
                        GH¢{bundle.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBundle && (
            <div className="bg-muted rounded-xl p-4 animate-fade-in">
              {(() => {
                const bundle = packages.find((b) => b.id === selectedBundle);
                return bundle ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{bundle.size}</p>
                      <p className="text-sm text-muted-foreground">
                        Valid for {bundle.validity}
                      </p>
                    </div>
                    <p className="text-2xl font-display font-bold text-primary">
                      GH¢{bundle.price}
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div>
            <Label htmlFor="phone">Recipient Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 0241234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button
            variant="gradient"
            size="xl"
            className="w-full"
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? "Loading..." : "Purchase Bundle"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
