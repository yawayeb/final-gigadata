import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "purple" | "green" | "blue" | "pink" | "orange";
  className?: string;
}

const variantStyles = {
  purple: "stat-card-purple",
  green: "stat-card-green",
  blue: "stat-card-blue",
  pink: "stat-card-pink",
  orange: "stat-card-orange",
};

const iconStyles = {
  purple: "bg-primary/10 text-primary",
  green: "bg-accent/10 text-accent",
  blue: "bg-blue-500/10 text-blue-500",
  pink: "bg-pink-500/10 text-pink-500",
  orange: "bg-orange-500/10 text-orange-500",
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = "purple",
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated animate-fade-in",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-display text-foreground">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-accent font-medium">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconStyles[variant]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
