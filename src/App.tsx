
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProductPage from "./pages/ProductPage";
import PricingPage from "./pages/PricingPage";
import ResourcesPage from "./pages/ResourcesPage";
import CustomersPage from "./pages/CustomersPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

// Dashboard pages
import ClientDashboard from "./pages/dashboard/Client";
import MortgageProfessionalDashboard from "./pages/dashboard/MortgageProfessional";
import RealtorDashboard from "./pages/dashboard/Realtor";
import BulkSearch from "./pages/dashboard/BulkSearch";
import LmiMarketingList from "./pages/dashboard/LmiMarketingList";

// Admin pages
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./pages/auth/UserManagement";
import MortgageBrokersPage from "./pages/admin/MortgageBrokersPage";
import RealtorsPage from "./pages/admin/RealtorsPage";
import ContactsPage from "./pages/admin/ContactsPage";
import SearchHistoryPage from "./pages/admin/SearchHistoryPage";
import { MarketingDashboard } from "./components/admin/marketing-dashboard/MarketingDashboard";
import SystemLogsPage from "./pages/admin/SystemLogsPage";

// Auth pages
import SettingsPage from "./pages/auth/SettingsPage";
import AdminTools from "./pages/auth/AdminTools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Dashboard routes */}
              <Route path="/dashboard/client" element={
                <ProtectedRoute requiredUserType="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/mortgage" element={
                <ProtectedRoute requiredUserType="mortgage_professional">
                  <MortgageProfessionalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/realtor" element={
                <ProtectedRoute requiredUserType="realtor">
                  <RealtorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/bulk-search" element={
                <ProtectedRoute>
                  <BulkSearch />
                </ProtectedRoute>
              } />
              <Route path="/lmi-marketing-list" element={
                <ProtectedRoute>
                  <LmiMarketingList />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="mortgage-brokers" element={<MortgageBrokersPage />} />
                <Route path="realtors" element={<RealtorsPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="search-history" element={<SearchHistoryPage />} />
                <Route path="marketing" element={<MarketingDashboard />} />
                <Route path="system/logs" element={<SystemLogsPage />} />
              </Route>

              {/* Settings routes */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin-tools" element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminTools />
                </ProtectedRoute>
              } />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
