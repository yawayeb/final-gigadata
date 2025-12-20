import { useState } from "react";
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
  RefreshCw,
  Gift,
  Calendar,
  Copy,
  CheckCircle,
  Users,
  Wallet,
  TramFront,
  Trophy,
  Zap,
  TrendingUp,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";

import { triggerEmail } from "@/lib/email";

const AffiliatePage = () => {
  const { toast } = useToast();
  const { profile, loading, refresh: refreshProfile } = useProfile();
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats();
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const config = {
    reference: `affiliate_${new Date().getTime()}`,
    email: profile?.email || "",
    amount: 50 * 100, // 50 GHS in pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      if (!profile) return;

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

      // 2. Insert the affiliate_fee transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          amount: 50.00,
          type: 'affiliate_fee',
          status: 'success',
          description: 'Payment for Affiliate Program Activation',
          reference: reference.reference
        });

      if (transError) throw transError;

      // 3. Trigger Affiliate Activation Email
      await triggerEmail({
        type: 'affiliate',
        email: profile.email,
        name: profile.full_name,
        amount: 50.00
      });

      toast({
        title: "Welcome to the Affiliate Program!",
        description: "Your payment was successful. Activation is complete!",
      });

      refreshProfile(); // Refresh to show the dashboard
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
      description: "You need to complete the payment to join the program.",
      variant: "destructive",
    });
  };

  const benefits = [
    {
      icon: Gift,
      title: "Instant GH¢5 Commission",
      description: "Receive GH¢5 immediately after successful payment of your referrals",
    },
    {
      icon: Users,
      title: "Unique Referral Code",
      description: "Automatically generated for tracking your referrals",
    },
    {
      icon: DollarSign,
      title: "Commission on Referrals",
      description: "Earn when referred users buy data or become affiliates",
    },
    {
      icon: Wifi,
      title: "1GB Free Data Monthly",
      description: "Get free data every month as an active affiliate",
    },
    {
      icon: Calendar,
      title: "Weekly Withdrawals",
      description: "Withdraw your earnings every week with no minimum",
    },
    {
      icon: RefreshCw,
      title: "Earn on First 5 Purchases",
      description: "Commission on first 5 purchases of your referred affiliates",
    },
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

  if (profile?.is_affiliate) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Affiliate Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your earnings and referrals
          </p>
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
            Share this code with friends to earn commissions when they sign up or purchase data.
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

        {/* Money Train Campaign Section (Dashboard) */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl p-8 border border-primary/20 shadow-elevated animate-fade-in mt-12" style={{ animationDelay: "400ms" }}>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <TramFront className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">
              🚆 Join the December–January Money Train
            </h2>
            <p className="text-muted-foreground max-w-xl">
              The last two months of the year are the best time to earn. Jump on the Edu-Hub Data affiliate train and cash out instantly while building long-term income.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border overflow-hidden mb-6">
            <div className="p-4 bg-primary/5 border-b border-border flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-display font-semibold">🎯 Milestone Rewards (Promo)</h3>
            </div>
            <div className="grid grid-cols-2 p-4 gap-y-4">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Referrals</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-right">Instant Reward</div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500">5</div>
                <span className="font-medium">5 invites</span>
              </div>
              <div className="font-bold text-accent text-right">₵120 MoMo</div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-500">10</div>
                <span className="font-medium">10 invites</span>
              </div>
              <div className="font-bold text-accent text-right">₵220 MoMo</div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-xs font-bold text-pink-500">15</div>
                <span className="font-medium">15 invites</span>
              </div>
              <div className="font-bold text-accent text-right">₵350 MoMo</div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-500">20</div>
                <span className="font-medium">20 invites</span>
              </div>
              <div className="font-bold text-accent text-right">₵500 MoMo</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10 mb-8">
            <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-foreground">
              <span className="text-accent font-bold">Bonus:</span> You will STILL earn your regular ₵5 commission for every single invite, on top of these milestone rewards.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="gradient"
              size="xl"
              className="px-10 h-16 text-lg font-bold group"
              onClick={() => window.open("https://t.me/screambooom", "_blank")}
            >
              <TrendingUp className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
              Join the Milestone Challenge
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
          Join the Affiliate Program
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock commissions, earn weekly income, and get free data by becoming an Edu-Hub Data partner.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="gradient-hero rounded-2xl p-8 text-white text-center shadow-elevated animate-fade-in">
        <p className="text-white/80 mb-2">One-time registration fee</p>
        <p className="text-5xl font-display font-bold mb-4">GH¢50</p>
        <p className="text-white/70 text-sm">
          Pay once, earn forever. No hidden fees or monthly charges.
        </p>
      </div>

      {/* Benefits Grid */}
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">
          Affiliate Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl shadow-card p-5 animate-fade-in hover:shadow-elevated transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
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
          {isProcessing ? "Processing..." : "Pay GH¢50 & Join Now"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By joining, you agree to our Terms of Service and Affiliate Policy.
        </p>
      </div>

      {/* Money Train Campaign Section (Landing) */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl p-8 border border-primary/20 shadow-elevated animate-fade-in" style={{ animationDelay: "400ms" }}>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <TramFront className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-3">
            🚆 Join the December–January Money Train
          </h2>
          <p className="text-muted-foreground max-w-xl">
            The last two months of the year are the best time to earn. Jump on the Edu-Hub Data affiliate train and cash out instantly while building long-term income.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-4 bg-primary/5 border-b border-border flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-display font-semibold">🎯 Milestone Rewards (Promo)</h3>
          </div>
          <div className="grid grid-cols-2 p-4 gap-y-4">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Referrals</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-right">Instant Reward</div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500">5</div>
              <span className="font-medium">5 invites</span>
            </div>
            <div className="font-bold text-accent text-right">₵120 MoMo</div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-500">10</div>
              <span className="font-medium">10 invites</span>
            </div>
            <div className="font-bold text-accent text-right">₵220 MoMo</div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-xs font-bold text-pink-500">15</div>
              <span className="font-medium">15 invites</span>
            </div>
            <div className="font-bold text-accent text-right">₵350 MoMo</div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-500">20</div>
              <span className="font-medium">20 invites</span>
            </div>
            <div className="font-bold text-accent text-right">₵500 MoMo</div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10 mb-8">
          <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-foreground">
            <span className="text-accent font-bold">Bonus:</span> You will STILL earn your regular ₵5 commission for every single invite, on top of these milestone rewards.
          </p>
        </div>

        <div className="justify-center flex">
          <Button
            variant="gradient"
            size="xl"
            className="px-10 h-16 text-lg font-bold group"
            onClick={() => window.open("https://t.me/screambooom", "_blank")}
          >
            <TrendingUp className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
            Join the Milestone Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
