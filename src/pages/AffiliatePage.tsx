import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

const AffiliatePage = () => {
  const { toast } = useToast();
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [generatedCode] = useState("EDUHUB-NY2025");

  // Mock affiliate data
  const affiliateData = {
    totalEarnings: "25.00",
    totalWithdrawn: "15.00",
    availableCommission: "10.00",
    totalReferrals: 3,
  };

  const benefits = [
    {
      icon: Gift,
      title: "Instant GH¢5 Commission",
      description: "Receive GH¢5 immediately after successful payment",
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

  const handleJoin = () => {
    // Simulate payment and joining
    toast({
      title: "Welcome to the Affiliate Program!",
      description: "You've successfully joined. Your referral code has been generated.",
    });
    setIsAffiliate(true);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleWithdraw = () => {
    if (parseFloat(affiliateData.availableCommission) <= 0) {
      toast({
        title: "No earnings to withdraw",
        description: "You need to have available earnings to withdraw.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Withdrawal Initiated",
      description: `GH¢${affiliateData.availableCommission} withdrawal request submitted.`,
    });
  };

  if (isAffiliate) {
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
              GH¢{affiliateData.totalEarnings}
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
              GH¢{affiliateData.totalWithdrawn}
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
              GH¢{affiliateData.availableCommission}
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
              {affiliateData.totalReferrals}
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
              {generatedCode}
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
            disabled={parseFloat(affiliateData.availableCommission) <= 0}
            className="px-12"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Withdraw Earnings
          </Button>
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
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
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
        >
          Pay GH¢50 & Join Now
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By joining, you agree to our Terms of Service and Affiliate Policy.
        </p>
      </div>
    </div>
  );
};

export default AffiliatePage;
