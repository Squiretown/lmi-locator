import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfessionalsPage from "./pages/admin/ProfessionalsPage";
import ContactsPage from "./pages/admin/ContactsPage";
import AdminContactsPage from "./pages/admin/AdminContactsPage";
import MarketingDashboard from "./pages/admin/MarketingDashboard";
import ToolsPage from "./pages/admin/ToolsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import MessagingPage from "./pages/admin/MessagingPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import RealtorDashboard from "./pages/dashboard/realtor/Dashboard";
import RealtorClients from "./pages/dashboard/realtor/Clients";
import RealtorMarketing from "./pages/dashboard/realtor/Marketing";
import MortgageDashboard from "./pages/dashboard/mortgage/Dashboard";
import MortgageClients from "./pages/dashboard/mortgage/Clients";
import MortgageMarketing from "./pages/dashboard/mortgage/Marketing";
import ClientDashboard from "./pages/dashboard/client/Dashboard";
import LMISearch from "./pages/LMISearch";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<LMISearch />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute userType="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/professionals" element={<ProtectedRoute userType="admin"><ProfessionalsPage /></ProtectedRoute>} />
            <Route path="/admin/professionals/:professionalId/contacts" element={<ProtectedRoute userType="admin"><ContactsPage /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute userType="admin"><AdminContactsPage /></ProtectedRoute>} />
            <Route path="/admin/marketing" element={<ProtectedRoute userType="admin"><MarketingDashboard /></ProtectedRoute>} />
            <Route path="/admin/tools" element={<ProtectedRoute userType="admin"><ToolsPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute userType="admin"><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin/messaging" element={<ProtectedRoute userType="admin"><MessagingPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute userType="admin"><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/permissions" element={<ProtectedRoute userType="admin"><PermissionsPage /></ProtectedRoute>} />
            
            {/* Realtor Routes */}
            <Route path="/dashboard/realtor" element={<ProtectedRoute userType="realtor"><RealtorDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/realtor/clients" element={<ProtectedRoute userType="realtor"><RealtorClients /></ProtectedRoute>} />
            <Route path="/dashboard/realtor/marketing" element={<ProtectedRoute userType="realtor"><RealtorMarketing /></ProtectedRoute>} />
            
            {/* Mortgage Professional Routes */}
            <Route path="/dashboard/mortgage" element={<ProtectedRoute userType="mortgage_professional"><MortgageDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/mortgage/clients" element={<ProtectedRoute userType="mortgage_professional"><MortgageClients /></ProtectedRoute>} />
            <Route path="/dashboard/mortgage/marketing" element={<ProtectedRoute userType="mortgage_professional"><MortgageMarketing /></ProtectedRoute>} />
            
            {/* Client Routes */}
            <Route path="/dashboard/client" element={<ProtectedRoute userType="client"><ClientDashboard /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
