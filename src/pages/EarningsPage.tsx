import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { SalesChart } from "@/components/dashboard/SalesChart";

const monthlyEarnings = [
  { name: "Jan", value: 0 },
  { name: "Feb", value: 0 },
  { name: "Mar", value: 0 },
  { name: "Apr", value: 0 },
  { name: "May", value: 1.5 },
  { name: "Jun", value: 2.0 },
  { name: "Jul", value: 2.1 },
];

const EarningsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Earnings
        </h1>
        <p className="text-muted-foreground">
          Track your commissions and affiliate earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
          <p className="text-3xl font-display font-bold text-foreground">
            GH¢5.60
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-3xl font-display font-bold text-foreground">
            GH¢2.10
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Last Payout</p>
          <p className="text-3xl font-display font-bold text-foreground">
            GH¢0.00
          </p>
        </div>
      </div>

      {/* Chart */}
      <SalesChart
        title="Monthly Earnings"
        data={monthlyEarnings}
        type="bar"
        showYearSelector
      />

      {/* Earnings History */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
        <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
          Earnings History
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No earnings history yet</p>
          <p className="text-sm">Start referring users to earn commissions</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
