import { Button } from "@/components/ui/button";
import { Wifi, DollarSign, RefreshCw, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AffiliateLockedCard = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Wifi, text: "1GB Free Data every month" },
    { icon: DollarSign, text: "Real commission earnings" },
    { icon: RefreshCw, text: "Earn from referrals & sales" },
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 border-2 border-dashed border-primary/30 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg text-card-foreground">
            Join the Affiliate Program
          </h3>
          <p className="text-sm text-muted-foreground">
            One-time fee: GH¢50
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Unlock commissions, earn weekly income, and get free data by becoming a partner.
      </p>

      <div className="space-y-3 mb-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 animate-slide-in-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-card-foreground">
                {benefit.text}
              </span>
            </div>
          );
        })}
      </div>

      <Button
        variant="gradient"
        className="w-full"
        onClick={() => navigate("/affiliate")}
      >
        Join Now & Start Earning
      </Button>
    </div>
  );
};
