
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SettingsPage from "./pages/auth/SettingsPage";
import AdminTools from "./pages/auth/AdminTools";
import UserManagement from "./pages/auth/UserManagement";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import MarketingDashboard from "./components/admin/marketing-dashboard/MarketingDashboard";
import ApiKeysPage from "./pages/admin/ApiKeysPage";
import ContactsPage from "./pages/admin/ContactsPage";
import RealtorsPage from "./pages/admin/RealtorsPage";
import MortgageBrokersPage from "./pages/admin/MortgageBrokersPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import SystemLogsPage from "./pages/admin/SystemLogsPage";
import DatabasePage from "./pages/admin/DatabasePage";
import SettingsPage as AdminSettingsPage from "./pages/admin/SettingsPage";
import SearchHistoryPage from "./pages/admin/search-history/SearchHistoryPage";
import ClientDashboard from "./pages/dashboard/Client";
import RealtorDashboard from "./pages/dashboard/Realtor";
import MortgageProfessionalDashboard from "./pages/dashboard/MortgageProfessional";
import BulkSearchDashboard from "./pages/dashboard/BulkSearch";
import LmiMarketingListDashboard from "./pages/dashboard/LmiMarketingList";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import CustomersPage from "./pages/CustomersPage";
import ProductPage from "./pages/ProductPage";
import ResourcesPage from "./pages/ResourcesPage";
import PricingPage from "./pages/PricingPage";
import HelpPage from "./pages/HelpPage";
import HelpManagementPage from "./pages/admin/HelpManagementPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/help" element={<HelpPage />} />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard/client" element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/realtor" element={
                <ProtectedRoute>
                  <RealtorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/mortgage" element={
                <ProtectedRoute>
                  <MortgageProfessionalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/bulk-search" element={
                <ProtectedRoute>
                  <BulkSearchDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/lmi-marketing" element={
                <ProtectedRoute>
                  <LmiMarketingListDashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected user settings */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Protected admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="marketing" element={<MarketingDashboard />} />
                <Route path="tools" element={<AdminTools />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="realtors" element={<RealtorsPage />} />
                <Route path="brokers" element={<MortgageBrokersPage />} />
                <Route path="permissions" element={<PermissionsPage />} />
                <Route path="logs" element={<SystemLogsPage />} />
                <Route path="database" element={<DatabasePage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="search-history" element={<SearchHistoryPage />} />
                <Route path="help" element={<HelpManagementPage />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
