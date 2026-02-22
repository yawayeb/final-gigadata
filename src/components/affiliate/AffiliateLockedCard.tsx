import { Button } from "@/components/ui/button";
import { Wifi, DollarSign, RefreshCw, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AffiliateLockedCard = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Wifi, text: "FREE 2GB Data every month" },
    { icon: DollarSign, text: "Access to Premium Digital Services" },
    { icon: RefreshCw, text: "AFA, WAEC, Social Media services" },
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 border-2 border-dashed border-primary/30 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg text-card-foreground">
            Giga Data Affiliate Program
          </h3>
          <p className="text-sm text-muted-foreground">
            Yearly plan: ₵150 / year
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Subscribe for ₵150/year and get 2GB free data monthly plus access to premium digital services.
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
