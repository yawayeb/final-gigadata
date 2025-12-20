import { cn } from "@/lib/utils";
import { 
  ArrowUpRight, 
  Calendar, 
  DollarSign, 
  Monitor, 
  MapPin 
} from "lucide-react";

interface AccountOverviewProps {
  recentTopUp: string;
  lastLogin: string;
  lastCommission: string;
  device: string;
  location: string;
  ipAddress: string;
}

export const AccountOverviewCard = ({
  recentTopUp,
  lastLogin,
  lastCommission,
  device,
  location,
  ipAddress,
}: AccountOverviewProps) => {
  const items = [
    {
      label: "Recent Top-Up",
      value: `GH¢${recentTopUp}`,
      icon: ArrowUpRight,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Last Login",
      value: lastLogin,
      subValue: "Web",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Last Commission Paid",
      value: lastCommission === "0" ? "GH¢0" : `GH¢${lastCommission}`,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Device",
      value: device,
      icon: Monitor,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Location",
      value: location,
      subValue: ipAddress,
      icon: MapPin,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
        Account Overview
      </h3>
      
      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-4 animate-slide-in-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  item.bgColor
                )}
              >
                <Icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-card-foreground truncate">
                    {item.value}
                  </p>
                  {item.subValue && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.subValue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
