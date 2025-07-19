
import { Toaster as Sonner } from "sonner";
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
import ErrorLogs from "./pages/admin/ErrorLogs";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import SearchHistoryPage from "./pages/admin/search-history/SearchHistoryPage";
import DashboardLayout from "./components/dashboard/layout/DashboardLayout";
import ClientOverview from "./pages/dashboard/client/Overview";
import ClientSearch from "./pages/dashboard/client/Search";
import SavedProperties from "./pages/dashboard/client/SavedProperties";
import RealtorOverview from "./pages/dashboard/realtor/Overview";
import RealtorClients from "./pages/dashboard/realtor/Clients";
import RealtorProperties from "./pages/dashboard/realtor/Properties";
import RealtorMarketing from "./pages/dashboard/realtor/Marketing";
import RealtorAnalytics from "./pages/dashboard/realtor/Analytics";
import RealtorTeam from "./pages/dashboard/realtor/Team";
import MortgageOverview from "./pages/dashboard/mortgage/Overview";
import MortgageClients from "./pages/dashboard/mortgage/Clients";
import MortgageAnalytics from "./pages/dashboard/mortgage/Analytics";
import MortgageTeam from "./pages/dashboard/mortgage/Team";
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
import { ClientRegistration } from "./pages/ClientRegistration";
import { RegistrationSuccess } from "./pages/RegistrationSuccess";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
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
              
              {/* Protected dashboard routes with layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                {/* Client dashboard routes */}
                <Route path="client" element={<ClientOverview />} />
                <Route path="client/search" element={<ClientSearch />} />
                <Route path="client/saved" element={<SavedProperties />} />
                
                {/* Realtor dashboard routes */}
                <Route path="realtor" element={<RealtorOverview />} />
                <Route path="realtor/clients" element={<RealtorClients />} />
                <Route path="realtor/properties" element={<RealtorProperties />} />
                <Route path="realtor/team" element={<RealtorTeam />} />
                <Route path="realtor/marketing" element={<RealtorMarketing />} />
                <Route path="realtor/analytics" element={<RealtorAnalytics />} />
                
                {/* Mortgage professional dashboard routes */}
                <Route path="mortgage" element={<MortgageOverview />} />
                <Route path="mortgage/clients" element={<MortgageClients />} />
                <Route path="mortgage/team" element={<MortgageTeam />} />
                <Route path="mortgage/analytics" element={<MortgageAnalytics />} />
                
                {/* Shared dashboard routes - Restricted to realtors and mortgage professionals */}
                <Route path="bulk-search" element={
                  <ProtectedRoute allowedUserTypes={['realtor', 'mortgage_professional', 'mortgage']}>
                    <BulkSearchDashboard />
                  </ProtectedRoute>
                } />
                <Route path="lmi-marketing" element={<LmiMarketingListDashboard />} />
              </Route>
              
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
                <Route path="error-logs" element={<ErrorLogs />} />
                <Route path="database" element={<DatabasePage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="search-history" element={<SearchHistoryPage />} />
                <Route path="help" element={<HelpManagementPage />} />
              </Route>
              
              {/* Client registration routes */}
              <Route path="/client-registration" element={<ClientRegistration />} />
              <Route path="/registration-success" element={<RegistrationSuccess />} />
              
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
