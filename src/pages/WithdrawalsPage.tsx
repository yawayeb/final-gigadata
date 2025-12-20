import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles = {
  success: { icon: CheckCircle, color: "text-accent", bg: "bg-accent/10" },
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const WithdrawalsPage = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { transactions, loading: transLoading, refresh: refreshTrans } = useTransactions(50);
  const { stats, refresh: refreshStats } = useDashboardStats();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const availableBalance = profile ? (Number(profile.total_earnings) - stats.totalWithdrawn) : 0;
  const withdrawalHistory = transactions.filter(t => t.type === 'withdrawal');

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!profile) return;

    if (!amount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available earnings.",
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
          amount: withdrawAmount,
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal request for GH¢${withdrawAmount}`,
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: `GH¢${amount} withdrawal has been submitted for processing.`,
      });
      setAmount("");
      refreshTrans();
      refreshStats();
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Withdrawals
        </h1>
        <p className="text-muted-foreground">
          Withdraw your earnings to your mobile money account
        </p>
      </div>

      {/* Balance & Withdraw Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gradient-hero rounded-2xl p-6 text-white shadow-elevated animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Available for Withdrawal</p>
              <p className="text-3xl font-display font-bold">
                GH¢{availableBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Weekly payouts • No minimum withdrawal amount
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
          <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
            Request Withdrawal
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (GH¢)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button
              variant="gradient"
              className="w-full"
              onClick={handleWithdraw}
              disabled={availableBalance <= 0 || isProcessing}
            >
              {isProcessing ? "Processing..." : "Withdraw Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-border">
          <h3 className="font-display font-semibold text-lg text-card-foreground">
            Withdrawal History
          </h3>
        </div>
        <div className="divide-y divide-border">
          {withdrawalHistory.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No withdrawal history found.
            </div>
          ) : (
            withdrawalHistory.map((withdrawal, index) => {
              const statusConfig = statusStyles[withdrawal.status as keyof typeof statusStyles] || statusStyles.pending;
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={withdrawal.id}
                  className="p-4 flex items-center gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      statusConfig.bg
                    )}
                  >
                    <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground">
                      GH¢{withdrawal.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mobile Money • {format(new Date(withdrawal.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize",
                      statusConfig.bg,
                      statusConfig.color
                    )}
                  >
                    {withdrawal.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalsPage;
