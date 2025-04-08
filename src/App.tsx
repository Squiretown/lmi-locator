
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import ApiDocs from '@/pages/ApiDocs';
import ApiTest from '@/pages/ApiTest';
import NotFound from '@/pages/NotFound';
import { AdminLayout, AdminDashboard, MarketingDashboard } from '@/components/admin';
import LoginPage from '@/pages/auth/LoginPage';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MortgageProfessionalDashboard from '@/pages/dashboard/MortgageProfessional';
import RealtorDashboard from '@/pages/dashboard/Realtor';
import ClientDashboard from '@/pages/dashboard/Client';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminTools from '@/pages/auth/AdminTools';

// Auth wrapper to manage redirection based on auth state
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { session, userType, isLoading, authInitialized } = useAuth();
  
  if (!authInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Debug logging
  console.log('AuthWrapper state:', { session, userType, isLoading, authInitialized });
  
  // Not authenticated, render children (should be login page)
  if (!session) return <>{children}</>;
  
  // User is authenticated, redirect based on user type
  switch (userType) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'mortgage_professional':
      return <Navigate to="/mortgage" replace />;
    case 'realtor':
      return <Navigate to="/realtor" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    default:
      // If we have a session but no userType yet, wait for it to load
      if (session && !userType && !isLoading) {
        console.log('Has session but no user type yet');
        return <>{children}</>; // Stay on current page until userType loads
      }
      return <Navigate to="/" replace />;
  }
};

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth routes */}
            <Route path="/login" element={
              <AuthWrapper>
                <LoginPage />
              </AuthWrapper>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredUserType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="tools" element={<AdminTools />} />
            </Route>
            
            {/* Mortgage Professional routes */}
            <Route path="/mortgage" element={
              <ProtectedRoute requiredUserType="mortgage_professional">
                <MortgageProfessionalDashboard />
              </ProtectedRoute>
            } />
            
            {/* Realtor routes */}
            <Route path="/realtor" element={
              <ProtectedRoute requiredUserType="realtor">
                <RealtorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Client routes */}
            <Route path="/client" element={
              <ProtectedRoute requiredUserType="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            {/* API routes */}
            <Route path="/api/docs" element={<ApiDocs />} />
            <Route path="/api/test" element={<ApiTest />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
