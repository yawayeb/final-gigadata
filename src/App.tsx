import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ServicesPage from "./pages/ServicesPage";
import CreditsPage from "./pages/CreditsPage";
import EarningsPage from "./pages/EarningsPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import PerformancePage from "./pages/PerformancePage";
import DevelopersPage from "./pages/DevelopersPage";
import AffiliatePage from "./pages/AffiliatePage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:service" element={<ServicesPage />} />
              <Route path="/credits" element={<CreditsPage />} />
              <Route path="/earnings" element={<EarningsPage />} />
              <Route path="/withdrawals" element={<WithdrawalsPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/performance/sales" element={<PerformancePage />} />
              <Route path="/developers" element={<DevelopersPage />} />
              <Route path="/developers/apis" element={<DevelopersPage />} />
              <Route path="/affiliate" element={<AffiliatePage />} />
              <Route path="/services/affiliate-program" element={<AffiliatePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
