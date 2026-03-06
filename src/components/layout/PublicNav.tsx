import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Wifi, Search, LogIn, UserPlus, GraduationCap } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/", label: "Buy Data", icon: Wifi },
  { to: "/reorder", label: "Reorder", icon: Search },
];

export const PublicNav = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-foreground font-display font-bold"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg">GigaData</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive =
              location.pathname === to ||
              (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link key={label} to={to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-foreground",
                    isActive && "text-primary font-medium bg-primary/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link to="/auth?tab=login">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link to="/auth?tab=signup">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
