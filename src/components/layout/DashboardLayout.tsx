import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

import { BottomNav } from "./BottomNav";

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-6 mb-20 lg:mb-0 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <span>© 2025 Edu-Hub Data Limited. All Rights Reserved.</span>
          <span>Built by SmartDEV Engineering</span>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
};
