
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import ClientLoginPage from "./pages/auth/ClientLoginPage";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ClientRegistration } from "./pages/ClientRegistration";
import { RegistrationSuccess } from "./pages/RegistrationSuccess";
import { AcceptInvitationPage } from "./components/invitations/AcceptInvitationPage";
import UnifiedInvitationDemo from "./pages/UnifiedInvitationDemo";

// Import all page components
import ProductPage from "./pages/ProductPage";
import ResourcesPage from "./pages/ResourcesPage";
import PricingPage from "./pages/PricingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
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
import RealtorTeam from "./pages/dashboard/realtor/Team";

// Mortgage Dashboard Pages
import MortgageOverview from "./pages/dashboard/mortgage/Overview";
import MortgageClients from "./pages/dashboard/mortgage/Clients";
import MortgageTeam from "./pages/dashboard/mortgage/Team";
// removed import MortgageAnalytics from "./pages/dashboard/mortgage/Analytics";

// Admin Layout and Pages
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminContactsPage from "./pages/admin/AdminContactsPage";
import ContactInquiries from "./pages/admin/ContactInquiries";
import { Dashboard as AdminDashboard } from "./components/admin/dashboard/DashboardContainer";
import UserManagement from "./pages/auth/UserManagement";
import AdminTools from "./pages/auth/AdminTools";
import SettingsPage from "./pages/admin/SettingsPage";
import SystemLogsPage from "./pages/admin/SystemLogsPage";
import ErrorLogs from "./pages/admin/ErrorLogs";
import DataProtectionPage from "./pages/admin/DataProtectionPage";
import SearchHistoryPage from "./pages/admin/SearchHistoryPage";
// Removed RealtorsPage as it's consolidated into professionals
// Removed MortgageBrokersPage as it's consolidated into professionals
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
import UserSettingsPage from "./pages/auth/SettingsPage";
import TestBrokerInvitation from "./pages/TestBrokerInvitation";
import SecurityDashboard from "./pages/admin/SecurityDashboard";

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
            
            <Route path="/test-broker-invitation" element={<TestBrokerInvitation />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/client-login" element={<ClientLoginPage />} />
            <Route path="/client-registration" element={<ClientRegistration />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
            <Route path="/invitation-acceptance/:token" element={<AcceptInvitationPage />} />
            <Route path="/unified-invitation-demo" element={<UnifiedInvitationDemo />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* User Settings Route */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <UserSettingsPage />
              </ProtectedRoute>
            } />
            
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
              <Route path="realtor/team" element={
                <ProtectedRoute allowedUserTypes={['realtor']}>
                  <RealtorTeam />
                </ProtectedRoute>
              } />
              
              {/* Mortgage Dashboard */}
              <Route path="mortgage" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional']}>
                  <MortgageOverview />
                </ProtectedRoute>
              } />
              <Route path="mortgage/clients" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional']}>
                  <MortgageClients />
                </ProtectedRoute>
              } />
              <Route path="mortgage/team" element={
                <ProtectedRoute allowedUserTypes={['mortgage_professional']}>
                  <MortgageTeam />
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
              <Route path="contact-inquiries" element={<ContactInquiries />} />
              {/* Realtor management consolidated into professionals page */}
              {/* Mortgage brokers management consolidated into professionals page */}
              
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
              <Route path="security" element={<SecurityDashboard />} />
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
