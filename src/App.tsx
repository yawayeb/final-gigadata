import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ServicesPage from "./pages/ServicesPage";
import AffiliatePage from "./pages/AffiliatePage";
import ProfilePage from "./pages/ProfilePage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ReorderPage from "./pages/ReorderPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigate } from "react-router-dom";
import MaintenancePage from "./pages/MaintenancePage";
import PublicAffiliatePage from "./pages/PublicAffiliatePage";

// Set to true to put the entire site in maintenance mode
const MAINTENANCE_MODE = false;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {MAINTENANCE_MODE ? (
            <Route path="*" element={<MaintenancePage />} />
          ) : (
          <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />
          <Route path="/reorder" element={<ReorderPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:service" element={<ServicesPage />} />

              <Route path="/affiliate" element={<AffiliatePage />} />
              <Route path="/services/affiliate-program" element={<AffiliatePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/withdrawals" element={<WithdrawalsPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            </Route>
          </Route>

          <Route path="/affiliate-info" element={<PublicAffiliatePage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="*" element={<NotFound />} />
          </>
          )}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
