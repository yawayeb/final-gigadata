import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Wifi,
  DollarSign,
  Gift,
  Calendar,
  Copy,
  CheckCircle,
  Users,
  Wallet,
  Rocket,
  Star,
  AlertCircle,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";

import { triggerEmail } from "@/lib/email";

const AffiliatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, refresh: refreshProfile } = useProfile();
  const { stats, refresh: refreshStats } = useDashboardStats();
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const config = {
    reference: `affiliate_${new Date().getTime()}`,
    email: profile?.email || "",
    amount: 150 * 100, // 150 GHS in pesewas (Yearly Affiliate Program)
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
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: profile?.full_name || "",
        },
        {
          display_name: "Product",
          variable_name: "product",
          value: "Yearly Affiliate Program (₵150/year)",
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      if (!profile) return;

      // Calculate 12-month expiry from today
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const expiresAtISO = expiresAt.toISOString();

      // 1. If a referral code was entered, link it now if not already linked
      if (referralCodeInput.startsWith("EDUHUB-") && !profile.is_affiliate) {
        const { data: refProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCodeInput.trim())
          .single();

        if (refProfile) {
          await supabase
            .from('profiles')
            .update({ referred_by: refProfile.id })
            .eq('id', profile.id);
        }
      }

      // 2. Mark affiliate active + set 12-month expiry on the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_affiliate: true,
          affiliate_expires_at: expiresAtISO,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // 3. Insert the affiliate_fee transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          amount: 150.00,
          type: 'affiliate_fee',
          status: 'success',
          description: 'Yearly Affiliate Program – ₵150/year',
          reference: reference.reference
        });

      if (transError) throw transError;

      // 4. Trigger Affiliate Activation Email
      await triggerEmail({
        type: 'affiliate',
        email: profile.email,
        name: profile.full_name,
        amount: 150.00
      });

      toast({
        title: "Welcome to the Giga Data Affiliate Program! 🎉",
        description: `Your subscription is active until ${expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      });

      refreshProfile();
      navigate("/order-confirmation", { state: { reference: reference.reference } });
    } catch (error: any) {
      toast({
        title: "Activation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "You need to complete the payment to subscribe.",
      variant: "destructive",
    });
  };

  const digitalServices = [
    "AFA Registrations",
    "WAEC Scratch Cards",
    "TikTok Likes & Followers",
    "Facebook Likes & Followers",
    "Instagram Likes & Followers",
  ];

  const handleJoin = async () => {
    if (!profile?.email) {
      toast({
        title: "Profile Loading",
        description: "Please wait for your profile to load.",
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

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!profile) return;

    const available = Number(profile.total_earnings) - stats.totalWithdrawn;

    if (available <= 0) {
      toast({
        title: "No earnings to withdraw",
        description: "You need to have available earnings to withdraw.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          amount: available,
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal request for GH¢${available}`
        });

      if (error) throw error;

      await triggerEmail({
        type: 'withdrawal',
        email: profile.email,
        name: profile.full_name,
        amount: available
      });

      toast({
        title: "Withdrawal Initiated",
        description: `Your request for GH¢${available} is being processed.`,
      });

      refreshStats();
    } catch (err: any) {
      toast({
        title: "Withdrawal Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading affiliate details...</div>;
  }

  // Check if subscription is expired
  const isExpired =
    profile?.is_affiliate &&
    profile?.affiliate_expires_at &&
    new Date(profile.affiliate_expires_at) < new Date();

  const expiryFormatted = profile?.affiliate_expires_at
    ? new Date(profile.affiliate_expires_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  // ── ACTIVE AFFILIATE DASHBOARD ──────────────────────────────────────────────
  if (profile?.is_affiliate && !isExpired) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Affiliate Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your earnings and referrals
          </p>
          {expiryFormatted && (
            <p className="text-xs text-muted-foreground mt-1">
              Subscription active until <span className="font-semibold text-green-600">{expiryFormatted}</span>
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">
              GH¢{profile.total_earnings}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Withdrawn</span>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">
              GH¢{stats.totalWithdrawn.toFixed(2)}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">
              GH¢{(Number(profile.total_earnings) - stats.totalWithdrawn).toFixed(2)}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">
              {profile.total_referrals}
            </p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
          <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
            Your Referral Code
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold text-primary">
              {profile.referral_code}
            </div>
            <Button variant="outline" size="icon" onClick={copyReferralCode}>
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Share this code with friends to earn <span className="font-semibold text-accent">₵5 commission</span> for every successful referral — no limits.
          </p>
        </div>

        {/* Withdraw Button */}
        <div className="flex justify-center">
          <Button
            variant="gradient"
            size="xl"
            onClick={handleWithdraw}
            disabled={isProcessing || (Number(profile.total_earnings) - stats.totalWithdrawn) <= 0}
            className="px-12"
          >
            <Wallet className="w-5 h-5 mr-2" />
            {isProcessing ? "Processing..." : "Withdraw Earnings"}
          </Button>
        </div>

        {/* Annual Affiliate Benefits Reminder */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl p-8 border border-primary/20 shadow-elevated animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              🚀 Your Annual Affiliate Benefits
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm">
              Build steady income while enjoying exclusive monthly data rewards and premium digital services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border text-center">
              <Wifi className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="font-bold text-primary text-lg">FREE 2GB</p>
              <p className="text-xs text-muted-foreground">Every month for 12 months</p>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border text-center">
              <DollarSign className="w-7 h-7 text-accent mx-auto mb-2" />
              <p className="font-bold text-accent text-lg">₵5 / Referral</p>
              <p className="text-xs text-muted-foreground">Unlimited commission on referrals</p>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border text-center">
              <Star className="w-7 h-7 text-yellow-500 mx-auto mb-2" />
              <p className="font-bold text-foreground text-lg">Premium Services</p>
              <p className="text-xs text-muted-foreground">AFA, WAEC, Social Media & more</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EXPIRED SUBSCRIPTION ────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 flex items-start gap-4 animate-fade-in">
          <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-lg text-foreground mb-1">Your Subscription Has Expired</h2>
            <p className="text-sm text-muted-foreground">
              Your annual affiliate subscription expired on <span className="font-semibold">{expiryFormatted}</span>. Renew now to continue
              enjoying your benefits.
            </p>
          </div>
        </div>

        {/* Renewal CTA — same landing page content below */}
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Renew Your Subscription</h1>
          <p className="text-base text-muted-foreground">
            Subscribe again for <span className="font-bold text-primary">₵150 / year</span> to reactivate all benefits.
          </p>
        </div>

        <div className="gradient-hero rounded-2xl p-8 text-white text-center shadow-elevated animate-fade-in">
          <p className="text-white/80 mb-1 text-sm uppercase tracking-widest font-semibold">Annual Renewal</p>
          <p className="text-6xl font-display font-bold mb-1">₵150</p>
          <p className="text-white/80 text-base font-semibold mb-3">per year</p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2 text-white font-bold text-lg">
            <Wifi className="w-5 h-5" />
            FREE 2GB Every Month
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
          <Button variant="gradient" size="xl" className="w-full" onClick={handleJoin} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Renew for ₵150 / Year"}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            By renewing, you agree to our Terms of Service and Affiliate Policy.
          </p>
        </div>
      </div>
    );
  }

  // ── NON-AFFILIATE LANDING PAGE ──────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
          🚀 Join the Giga Data Affiliate Program
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Build steady income while enjoying exclusive monthly data rewards. Our affiliate program is designed to help
          you earn consistently while accessing premium digital services.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="gradient-hero rounded-2xl p-8 text-white text-center shadow-elevated animate-fade-in">
        <p className="text-white/80 mb-1 text-sm uppercase tracking-widest font-semibold">💼 Annual Affiliate Subscription</p>
        <p className="text-6xl font-display font-bold mb-1">₵150</p>
        <p className="text-white/80 text-base font-semibold mb-3">per year</p>
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2 text-white font-bold text-lg">
          <Wifi className="w-5 h-5" />
          FREE 2GB Every Month
        </div>
        <p className="text-white/70 text-xs mt-3">
          12-month subscription · Renews annually
        </p>
      </div>

      {/* What You Get */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Join for ₵150 per year and enjoy:</h2>

        {/* 2GB Monthly */}
        <div className="bg-card rounded-2xl shadow-card p-5 flex items-start gap-4 animate-fade-in hover:shadow-elevated transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Wifi className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary mb-1">🎁 FREE 2GB Every Month</h3>
            <p className="text-sm text-muted-foreground">
              Receive 2GB of data every month for 12 months after subscribing.
            </p>
          </div>
        </div>

        {/* ₵5 Per Referral */}
        <div className="bg-card rounded-2xl shadow-card p-5 flex items-start gap-4 animate-fade-in hover:shadow-elevated transition-shadow" style={{ animationDelay: "80ms" }}>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-accent mb-1">💰 Earn Per Referral</h3>
            <p className="text-sm text-muted-foreground">
              Earn <span className="font-semibold text-foreground">₵5 commission</span> for every successful referral — no limits.
            </p>
          </div>
        </div>

        {/* Premium Digital Services */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in hover:shadow-elevated transition-shadow" style={{ animationDelay: "160ms" }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-card-foreground mb-1">🌟 Access to Premium Services</h3>
              <p className="text-sm text-muted-foreground">Affiliate members also get access to:</p>
            </div>
          </div>
          <ul className="space-y-2 pl-2">
            {digitalServices.map((service, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-card-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "240ms" }}>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">📌 Subscription Details</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Annual Fee</span>
            <span className="font-bold text-primary">₵150</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Duration</span>
            <span className="font-bold text-foreground">12 Months</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Wifi className="w-4 h-4" /> Monthly Bonus</span>
            <span className="font-bold text-green-600">2GB Free Data</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Per Referral</span>
            <span className="font-bold text-accent">₵5 Commission</span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
        <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
          Complete Registration
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="referralCode">
              Enter Referral Code (Optional)
            </Label>
            <Input
              id="referralCode"
              placeholder="e.g., EDUHUB-ABC123"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If you were referred by someone, enter their code here.
            </p>
          </div>
        </div>

        <Button
          variant="gradient"
          size="xl"
          className="w-full"
          onClick={handleJoin}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Subscribe for ₵150 / Year"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By subscribing, you agree to our Terms of Service and Affiliate Policy.
        </p>
      </div>
    </div>
  );
};

export default AffiliatePage;
