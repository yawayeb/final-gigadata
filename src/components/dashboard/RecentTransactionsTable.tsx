import { cn } from "@/lib/utils";

interface Transaction {
  orderId: string;
  msisdn: string;
  value: string;
  status: "Delivered" | "Pending" | "Failed";
  time: string;
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  title?: string;
}

const statusStyles = {
  Delivered: "bg-accent/10 text-accent",
  Pending: "bg-yellow-500/10 text-yellow-600",
  Failed: "bg-destructive/10 text-destructive",
};

export const RecentTransactionsTable = ({
  transactions,
  title = "Recent AT Transactions",
}: RecentTransactionsTableProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
        {title}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Order ID
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                MSISDN
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Value
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr
                key={tx.orderId}
                className="border-b border-border/50 last:border-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <td className="py-3 px-2">
                  <span className="text-destructive font-medium text-sm">
                    #{tx.orderId}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-card-foreground">
                  {tx.msisdn}
                </td>
                <td className="py-3 px-2 text-sm font-medium text-card-foreground">
                  {tx.value}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      statusStyles[tx.status]
                    )}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-muted-foreground">
                  {tx.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
