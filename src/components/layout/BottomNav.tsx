import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wifi, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
        { icon: Wifi, label: "Services", path: "/services" },
        { icon: Users, label: "Affiliate", path: "/affiliate" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border px-6 py-3 z-50">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]")} />
                            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
