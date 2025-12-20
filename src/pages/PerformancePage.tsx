import { SalesChart } from "@/components/dashboard/SalesChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { ShoppingCart, TrendingUp, Target, Award } from "lucide-react";

const weeklyData = [
  { name: "Mon", value: 5 },
  { name: "Tue", value: 12 },
  { name: "Wed", value: 8 },
  { name: "Thu", value: 15 },
  { name: "Fri", value: 20 },
  { name: "Sat", value: 25 },
  { name: "Sun", value: 18 },
];

const monthlyData = [
  { name: "Jan", value: 50 },
  { name: "Feb", value: 75 },
  { name: "Mar", value: 60 },
  { name: "Apr", value: 90 },
  { name: "May", value: 120 },
  { name: "Jun", value: 150 },
  { name: "Jul", value: 180 },
];

const PerformancePage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Sales Performance
        </h1>
        <p className="text-muted-foreground">
          Track your sales metrics and performance trends
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="GH¢180.00"
          icon={ShoppingCart}
          variant="purple"
          trend="+15% from last month"
        />
        <StatCard
          title="Total Orders"
          value="45"
          icon={TrendingUp}
          variant="green"
          trend="+8 this week"
        />
        <StatCard
          title="Conversion Rate"
          value="68%"
          icon={Target}
          variant="blue"
        />
        <StatCard
          title="Top Seller Rank"
          value="#12"
          icon={Award}
          variant="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart
          title="Weekly Performance"
          data={weeklyData}
          trend="+23% vs last week"
          type="line"
        />
        <SalesChart
          title="Monthly Performance"
          data={monthlyData}
          type="bar"
          showYearSelector
        />
      </div>

      {/* Performance Tips */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
        <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
          Performance Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted">
            <h4 className="font-semibold text-foreground mb-2">
              📈 Increase Sales
            </h4>
            <p className="text-sm text-muted-foreground">
              Share your referral code on social media to attract more customers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted">
            <h4 className="font-semibold text-foreground mb-2">
              🎯 Target Market
            </h4>
            <p className="text-sm text-muted-foreground">
              Focus on students and small businesses for consistent sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
