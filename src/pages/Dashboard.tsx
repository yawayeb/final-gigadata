import { ShoppingCart, Package, Users, Coins } from "lucide-react";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { AccountOverviewCard } from "@/components/dashboard/AccountOverviewCard";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { SalesPointsCard } from "@/components/dashboard/SalesPointsCard";
import { AffiliateLockedCard } from "@/components/affiliate/AffiliateLockedCard";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const { transactions, loading: transLoading } = useTransactions(5);
  const { stats, loading: statsLoading } = useDashboardStats();
  const navigate = useNavigate();

  const handleWithdraw = () => {
    navigate("/withdrawals");
  };

  if (profileLoading || statsLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading dashboard...</div>;
  }

  // Map database transactions to UI format
  const mappedTransactions = transactions.map(t => ({
    orderId: t.id.slice(0, 8),
    msisdn: t.description.match(/\d{10}/)?.[0] || "N/A",
    value: t.amount.toString(),
    status: (t.status.charAt(0).toUpperCase() + t.status.slice(1)) as any,
    time: formatDistanceToNow(new Date(t.created_at), { addSuffix: true }),
  }));

  const availableBalance = profile ? (Number(profile.total_earnings) - stats.totalWithdrawn).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HeroCard
            userName={profile?.full_name || "User"}
            totalEarnings={availableBalance}
            onWithdraw={handleWithdraw}
          />
        </div>
        <div>
          {profile?.is_affiliate ? (
            <AccountOverviewCard
              recentTopUp="N/A" // This could be fetched from transactions
              lastLogin="Real-time Active"
              lastCommission="0"
              device="Active Device"
              location="GH"
              ipAddress="Connected"
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
          value={`GH¢${profile?.total_sales || 0}`}
          icon={ShoppingCart}
          variant="purple"
        />
        <StatCard
          title="Total Orders"
          value={profile?.total_orders.toString() || "0"}
          icon={Package}
          variant="green"
        />
        <StatCard
          title="Total Referrals"
          value={profile?.total_referrals.toString() || "0"}
          icon={Users}
          variant="blue"
        />
        <StatCard
          title="Total Commission"
          value={`GH¢${profile?.total_earnings || 0}`}
          icon={Coins}
          variant="pink"
        />
      </div>

      {/* Account Overview & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountOverviewCard
          recentTopUp="0.00"
          lastLogin="Connected"
          lastCommission="0"
          device="Active Session"
          location="GH"
          ipAddress="Encrypted"
        />
        <RecentTransactionsTable transactions={mappedTransactions} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart
          title="Weekly Sales"
          data={stats.weeklySales}
          trend="+0%"
          type="line"
        />
        <SalesChart
          title="Monthly Sales"
          data={stats.monthlySales}
          type="bar"
          showYearSelector
        />
        <SalesPointsCard total={profile?.total_sales.toString() || "0.00"} />
      </div>
    </div>
  );
};

export default Dashboard;
