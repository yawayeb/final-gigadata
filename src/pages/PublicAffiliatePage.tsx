import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicBottomNav } from "@/components/layout/PublicBottomNav";
import { SystemNoticeBanner } from "@/components/SystemNoticeBanner";
import { useAuth } from "@/hooks/useAuth";
import {
  Wifi,
  DollarSign,
  Gift,
  CheckCircle,
  Users,
  Rocket,
  Star,
  LogIn,
  UserPlus,
  Calendar,
} from "lucide-react";

const digitalServices = [
  "AFA Registrations",
  "WAEC Scratch Cards",
  "TikTok Likes & Followers",
  "Facebook Likes & Followers",
  "Instagram Likes & Followers",
];

export default function PublicAffiliatePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 lg:pb-0">
      <SystemNoticeBanner />
      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Hero */}
        <section className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Giga Data Affiliate Program
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Earn money while enjoying exclusive monthly data rewards. Join thousands of affiliates building
            steady income with Giga Data.
          </p>
        </section>

        {/* Pricing card */}
        <div className="gradient-hero rounded-2xl p-8 text-white text-center shadow-elevated mb-8 animate-fade-in">
          <p className="text-white/80 mb-1 text-sm uppercase tracking-widest font-semibold">Annual Affiliate Subscription</p>
          <p className="text-6xl font-display font-bold mb-1">₵150</p>
          <p className="text-white/80 text-base font-semibold mb-3">per year</p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2 text-white font-bold text-lg">
            <Wifi className="w-5 h-5" />
            FREE 2GB Every Month
          </div>
          <p className="text-white/70 text-xs mt-3">12-month subscription · Renews annually</p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-display font-semibold text-foreground">Join and enjoy:</h2>

          <div className="bg-card rounded-2xl shadow-card p-5 flex items-start gap-4 animate-fade-in hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wifi className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary mb-1">FREE 2GB Every Month</h3>
              <p className="text-sm text-muted-foreground">Receive 2GB of data every month for 12 months after subscribing.</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 flex items-start gap-4 animate-fade-in hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-accent mb-1">Earn ₵5 Per Referral</h3>
              <p className="text-sm text-muted-foreground">
                Earn <span className="font-semibold text-foreground">₵5 commission</span> for every successful referral — no limits.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-in hover:shadow-elevated transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-card-foreground mb-1">Access to Premium Services</h3>
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

        {/* Subscription details */}
        <div className="bg-card rounded-2xl shadow-card p-5 mb-8 animate-fade-in">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Subscription Details</h2>
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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl shadow-card p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-bold text-foreground text-lg">1,000+</p>
            <p className="text-xs text-muted-foreground">Active Affiliates</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-4 text-center">
            <DollarSign className="w-6 h-6 text-accent mx-auto mb-1" />
            <p className="font-bold text-foreground text-lg">₵5</p>
            <p className="text-xs text-muted-foreground">Per Referral</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="font-bold text-foreground text-lg">12mo</p>
            <p className="text-xs text-muted-foreground">Subscription</p>
          </div>
        </div>

        {/* CTA — logged in vs guest */}
        {isLoggedIn ? (
          <div className="bg-card rounded-2xl shadow-card p-6 text-center animate-fade-in">
            <p className="text-muted-foreground mb-4">You're logged in. Join the affiliate program from your dashboard.</p>
            <Button
              variant="gradient" size="xl" className="w-full"
              onClick={() => navigate("/affiliate")}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Go to Affiliate Dashboard
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
            <div className="text-center mb-5">
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Ready to start earning?
              </h3>
              <p className="text-muted-foreground text-sm">
                Create a free account or log in to join the affiliate program and start earning commissions.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg" className="w-full gap-2 font-semibold"
                onClick={() => navigate("/auth?tab=signup")}
              >
                <UserPlus className="w-5 h-5" />
                Create Free Account
              </Button>
              <Button
                variant="outline" size="lg" className="w-full gap-2"
                onClick={() => navigate("/auth?tab=login")}
              >
                <LogIn className="w-5 h-5" />
                Log In to My Account
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              After signing up, go to the Affiliate section to subscribe for ₵150/year.
            </p>
          </div>
        )}
      </main>

      <PublicBottomNav />
    </div>
  );
}
