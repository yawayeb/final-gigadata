import { TrendingUp } from "lucide-react";

interface SalesPointsCardProps {
  total: string;
}

export const SalesPointsCard = ({ total }: SalesPointsCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-display font-semibold text-lg mb-2 text-card-foreground">
          Sales Points
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Total Product Sales
        </p>
        <p className="text-3xl font-bold font-display text-primary">
          GH¢{total}
        </p>
      </div>

      {/* Circular progress decoration */}
      <div className="absolute bottom-4 right-4 w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset="200"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <TrendingUp
            className="text-primary"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
};
