import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: string;
  description: string;
  date: string;
  balance: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "credit",
    amount: "50.00",
    description: "Wallet Top-up via Mobile Money",
    date: "Dec 20, 2025 10:30 AM",
    balance: "94.60",
  },
  {
    id: "2",
    type: "debit",
    amount: "28.00",
    description: "10GB AT iShare Bundle Purchase",
    date: "Dec 19, 2025 3:45 PM",
    balance: "44.60",
  },
  {
    id: "3",
    type: "debit",
    amount: "7.00",
    description: "2GB MTN UP2U Bundle Purchase",
    date: "Dec 18, 2025 11:20 AM",
    balance: "72.60",
  },
  {
    id: "4",
    type: "credit",
    amount: "30.00",
    description: "Wallet Top-up via Bank Transfer",
    date: "Dec 17, 2025 9:00 AM",
    balance: "79.60",
  },
];

const CreditsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Credits & Debits
        </h1>
        <p className="text-muted-foreground">
          View your transaction history and wallet activity
        </p>
      </div>

      {/* Balance Card */}
      <div className="gradient-hero rounded-2xl p-6 text-white shadow-elevated animate-fade-in">
        <p className="text-white/80 text-sm mb-1">Current Balance</p>
        <p className="text-4xl font-display font-bold">GH¢94.60</p>
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-border">
          <h3 className="font-display font-semibold text-lg text-card-foreground">
            Transaction History
          </h3>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="p-4 flex items-center gap-4 animate-fade-in hover:bg-muted/30 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  tx.type === "credit"
                    ? "bg-accent/10"
                    : "bg-destructive/10"
                )}
              >
                {tx.type === "credit" ? (
                  <ArrowDownLeft className="w-5 h-5 text-accent" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">
                  {tx.description}
                </p>
                <p className="text-sm text-muted-foreground">{tx.date}</p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    tx.type === "credit" ? "text-accent" : "text-destructive"
                  )}
                >
                  {tx.type === "credit" ? "+" : "-"}GH¢{tx.amount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bal: GH¢{tx.balance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
