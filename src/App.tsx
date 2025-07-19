
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminContactsPage from "./pages/admin/AdminContactsPage";
import LoginPage from "./pages/auth/LoginPage";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Dashboard Layout and Pages
import DashboardLayout from "./components/dashboard/layout/DashboardLayout";
import ClientOverview from "./pages/dashboard/client/Overview";
import SavedProperties from "./pages/dashboard/client/SavedProperties";

// Realtor Dashboard Pages
import RealtorOverview from "./pages/dashboard/realtor/Overview";
import RealtorClients from "./pages/dashboard/realtor/Clients";
import RealtorProperties from "./pages/dashboard/realtor/Properties";
import RealtorAnalytics from "./pages/dashboard/realtor/Analytics";

// Mortgage Dashboard Pages
import MortgageOverview from "./pages/dashboard/mortgage/Overview";
import MortgageClients from "./pages/dashboard/mortgage/Clients";

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
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/contacts" element={
              <ProtectedRoute requiredUserType="admin">
                <AdminContactsPage />
              </ProtectedRoute>
            } />
            
            {/* Public Pages - Placeholder routes for navigation links */}
            <Route path="/product" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Product</h1>
                  <p className="text-muted-foreground">Product page coming soon</p>
                </div>
              </div>
            } />
            <Route path="/resources" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Resources</h1>
                  <p className="text-muted-foreground">Resources page coming soon</p>
                </div>
              </div>
            } />
            <Route path="/pricing" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Pricing</h1>
                  <p className="text-muted-foreground">Pricing page coming soon</p>
                </div>
              </div>
            } />
            <Route path="/customers" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Customers</h1>
                  <p className="text-muted-foreground">Customers page coming soon</p>
                </div>
              </div>
            } />
            <Route path="/blog" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Blog</h1>
                  <p className="text-muted-foreground">Blog page coming soon</p>
                </div>
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Contact</h1>
                  <p className="text-muted-foreground">Contact page coming soon</p>
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
