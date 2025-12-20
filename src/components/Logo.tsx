import { Wifi, GraduationCap } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export const Logo = ({ collapsed = false, className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-lg">
          <GraduationCap className="w-5 h-5 text-white absolute -top-0.5" />
          <Wifi className="w-4 h-4 text-white absolute bottom-1" />
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight text-sidebar-foreground">
            Edu-Hub
          </span>
          <span className="text-xs text-sidebar-foreground/70 font-medium">
            Data
          </span>
        </div>
      )}
    </div>
  );
};
