import { ShoppingCart, Package, Users, Coins } from "lucide-react";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { AccountOverviewCard } from "@/components/dashboard/AccountOverviewCard";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { SalesPointsCard } from "@/components/dashboard/SalesPointsCard";
import { AffiliateLockedCard } from "@/components/affiliate/AffiliateLockedCard";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockTransactions = [
  {
    orderId: "3991038",
    msisdn: "0241234567",
    value: "10GB",
    status: "Delivered" as const,
    time: "2 mins ago",
  },
  {
    orderId: "3991037",
    msisdn: "0551234567",
    value: "5GB",
    status: "Delivered" as const,
    time: "15 mins ago",
  },
  {
    orderId: "3991036",
    msisdn: "0271234567",
    value: "2GB",
    status: "Pending" as const,
    time: "1 hour ago",
  },
];

const weeklyData = [
  { name: "Mon", value: 0 },
  { name: "Tue", value: 0 },
  { name: "Wed", value: 0 },
  { name: "Thu", value: 0 },
  { name: "Fri", value: 0 },
  { name: "Sat", value: 0 },
  { name: "Sun", value: 0 },
];

const monthlyData = [
  { name: "Jan", value: 10 },
  { name: "Feb", value: 15 },
  { name: "Mar", value: 8 },
  { name: "Apr", value: 22 },
  { name: "May", value: 18 },
  { name: "Jun", value: 30 },
  { name: "Jul", value: 44.4 },
];

const Dashboard = () => {
  const { toast } = useToast();
  const isAffiliate = false; // This would come from user state

  const handleWithdraw = () => {
    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HeroCard
            userName="Nana Yaw"
            totalEarnings="5.60"
            onWithdraw={handleWithdraw}
          />
        </div>
        <div>
          {isAffiliate ? (
            <AccountOverviewCard
              recentTopUp="50.00"
              lastLogin="Dec 20, 2025 | 10:30 AM"
              lastCommission="0"
              device="Desktop – Windows – Edge"
              location="GH"
              ipAddress="192.168.1.1"
            />
          ) : (
            <AffiliateLockedCard />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value="GH¢44.4"
          icon={ShoppingCart}
          variant="purple"
        />
        <StatCard
          title="Total Orders"
          value="2"
          icon={Package}
          variant="green"
        />
        <StatCard
          title="Total Referrals"
          value="0"
          icon={Users}
          variant="blue"
        />
        <StatCard
          title="Total Commission"
          value="GH¢0.067"
          icon={Coins}
          variant="pink"
        />
      </div>

      {/* Account Overview & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountOverviewCard
          recentTopUp="50.00"
          lastLogin="Dec 20, 2025 | 10:30 AM"
          lastCommission="0"
          device="Desktop – Windows – Edge"
          location="GH"
          ipAddress="192.168.1.1"
        />
        <RecentTransactionsTable transactions={mockTransactions} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart
          title="Weekly Sales"
          data={weeklyData}
          trend="+10%"
          type="line"
        />
        <SalesChart
          title="Monthly Sales"
          data={monthlyData}
          type="bar"
          showYearSelector
        />
        <SalesPointsCard total="0" />
      </div>
    </div>
  );
};

export default Dashboard;
