
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import all page components
import ProductPage from "./pages/ProductPage";
import ResourcesPage from "./pages/ResourcesPage";
import PricingPage from "./pages/PricingPage";
import CustomersPage from "./pages/CustomersPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";

// Dashboard Layout and Pages
import DashboardLayout from "./components/dashboard/layout/DashboardLayout";
import ClientOverview from "./pages/dashboard/client/Overview";
import SavedProperties from "./pages/dashboard/client/SavedProperties";
import ClientSearch from "./pages/dashboard/client/Search";

// Realtor Dashboard Pages
import RealtorOverview from "./pages/dashboard/realtor/Overview";
import RealtorClients from "./pages/dashboard/realtor/Clients";
import RealtorProperties from "./pages/dashboard/realtor/Properties";
import RealtorAnalytics from "./pages/dashboard/realtor/Analytics";
import RealtorMarketing from "./pages/dashboard/realtor/Marketing";
import RealtorTeam from "./pages/dashboard/realtor/Team";

// Mortgage Dashboard Pages
import MortgageOverview from "./pages/dashboard/mortgage/Overview";
import MortgageClients from "./pages/dashboard/mortgage/Clients";
import MortgageTeam from "./pages/dashboard/mortgage/Team";
import MortgageAnalytics from "./pages/dashboard/mortgage/Analytics";

// Admin Layout and Pages
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminContactsPage from "./pages/admin/AdminContactsPage";
import { Dashboard as AdminDashboard } from "./components/admin/dashboard/DashboardContainer";
import UserManagement from "./pages/auth/UserManagement";
import AdminTools from "./pages/auth/AdminTools";
import SettingsPage from "./pages/admin/SettingsPage";
import SystemLogsPage from "./pages/admin/SystemLogsPage";
import ErrorLogs from "./pages/admin/ErrorLogs";
import DataProtectionPage from "./pages/admin/DataProtectionPage";
import SearchHistoryPage from "./pages/admin/SearchHistoryPage";
import RealtorsPage from "./pages/admin/RealtorsPage";
import MortgageBrokersPage from "./pages/admin/MortgageBrokersPage";
import ContactsPage from "./pages/admin/ContactsPage";

// Previously Missing Admin Components - Now Added
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import { MarketingDashboard } from "./components/admin/marketing-dashboard/MarketingDashboard";
import AdminMessaging from "./pages/admin/messaging";
import PermissionsPage from "./pages/admin/PermissionsPage";
import DatabasePage from "./pages/admin/DatabasePage";
import ApiKeysPage from "./pages/admin/ApiKeysPage";
import LogsPage from "./pages/admin/LogsPage";
import HelpPage from "./pages/admin/HelpPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Client Dashboard */}
              <Route path="client" element={
                <ProtectedRoute allowedUserTypes={['client']}>
                  <ClientOverview />
                </ProtectedRoute>
              } />
              <Route path="client/saved-properties" element={
                <ProtectedRoute allowedUserTypes={['client']}>
                  <SavedProperties />
                </ProtectedRoute>
              } />
              <Route path="client/search" element={
                <ProtectedRoute allowedUserTypes={['client']}>
                  <ClientSearch />
                </ProtectedRoute>
              } />
              
              {/* Realtor Dashboard */}
              <Route path="realtor" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorOverview />
                </ProtectedRoute>
              } />
              <Route path="realtor/clients" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorClients />
                </ProtectedRoute>
              } />
              <Route path="realtor/properties" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorProperties />
                </ProtectedRoute>
              } />
              <Route path="realtor/analytics" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorAnalytics />
                </ProtectedRoute>
              } />
              <Route path="realtor/marketing" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorMarketing />
                </ProtectedRoute>
              } />
              <Route path="realtor/team" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorTeam />
                </ProtectedRoute>
              } />
              
              {/* Mortgage Dashboard */}
              <Route path="mortgage" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional', 'mortgage']}>
                  <MortgageOverview />
                </ProtectedRoute>
              } />
              <Route path="mortgage/clients" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional', 'mortgage']}>
                  <MortgageClients />
                </ProtectedRoute>
              } />
              <Route path="mortgage/team" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional', 'mortgage']}>
                  <MortgageTeam />
                </ProtectedRoute>
              } />
              <Route path="mortgage/analytics" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional', 'mortgage']}>
                  <MortgageAnalytics />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredUserType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              {/* Admin Dashboard */}
              <Route index element={<AdminDashboard />} />
              
              {/* Admin Management Pages */}
              <Route path="users" element={<UserManagement />} />
              <Route path="tools" element={<AdminTools />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="contacts" element={<AdminContactsPage />} />
              <Route path="realtors" element={<RealtorsPage />} />
              <Route path="mortgage-brokers" element={<MortgageBrokersPage />} />
              
              {/* Previously Missing Admin Routes - Now Fixed */}
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="messaging" element={<AdminMessaging />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="database" element={<DatabasePage />} />
              <Route path="api-keys" element={<ApiKeysPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="help" element={<HelpPage />} />
              
              {/* Admin System Pages */}
              <Route path="system-logs" element={<SystemLogsPage />} />
              <Route path="error-logs" element={<ErrorLogs />} />
              <Route path="data-protection" element={<DataProtectionPage />} />
              <Route path="search-history" element={<SearchHistoryPage />} />
              
              {/* Professional Contact Pages */}
              <Route path="contacts/:professionalId" element={<ContactsPage />} />
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                  <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
                  <a href="/" className="text-primary hover:underline">Go back home</a>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
