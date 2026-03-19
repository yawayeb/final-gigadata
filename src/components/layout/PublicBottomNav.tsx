import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Wifi, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const PublicBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isLoggedIn = !!session?.user;

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      onClick: () => navigate("/"),
    },
    {
      icon: Wifi,
      label: "Services",
      path: "/services",
      onClick: () => navigate(isLoggedIn ? "/services" : "/auth?tab=login"),
    },
    {
      icon: Users,
      label: "Affiliate",
      path: "/affiliate-info",
      onClick: () => navigate("/affiliate-info"),
    },
    {
      icon: User,
      label: "Profile",
      path: "/auth",
      onClick: () => navigate(isLoggedIn ? "/profile" : "/auth"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border px-6 py-3 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 px-3 py-1",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  isActive && "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                )}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
