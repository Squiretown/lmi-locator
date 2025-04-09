
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import ProductPage from '@/pages/ProductPage';
import ResourcesPage from '@/pages/ResourcesPage';
import PricingPage from '@/pages/PricingPage';
import CustomersPage from '@/pages/CustomersPage';
import BlogPage from '@/pages/BlogPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/auth/LoginPage';
import { AdminLayout, AdminDashboard, MarketingDashboard } from '@/components/admin';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MortgageProfessionalDashboard from '@/pages/dashboard/MortgageProfessional';
import RealtorDashboard from '@/pages/dashboard/Realtor';
import ClientDashboard from '@/pages/dashboard/Client';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminTools from '@/pages/auth/AdminTools';
import LmiMarketingList from '@/pages/dashboard/LmiMarketingList';
import NotFound from '@/pages/NotFound';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { session, userType, isLoading, authInitialized } = useAuth();
  
  if (!authInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!session) return <>{children}</>;
  
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
      if (session && !userType && !isLoading) {
        const metadataUserType = session.user?.user_metadata?.user_type;
        if (metadataUserType) {
          switch (metadataUserType) {
            case 'admin':
              return <Navigate to="/admin" replace />;
            case 'mortgage_professional':
              return <Navigate to="/mortgage" replace />;
            case 'realtor':
              return <Navigate to="/realtor" replace />;
            case 'client':
              return <Navigate to="/client" replace />;
          }
        }
        return <>{children}</>;
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
            <Route path="/product" element={<ProductPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/login" element={
              <AuthWrapper>
                <LoginPage />
              </AuthWrapper>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredUserType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="tools" element={<AdminTools />} />
            </Route>
            
            <Route path="/mortgage" element={
              <ProtectedRoute requiredUserType="mortgage_professional">
                <MortgageProfessionalDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/realtor" element={
              <ProtectedRoute requiredUserType="realtor">
                <RealtorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/client" element={
              <ProtectedRoute requiredUserType="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/marketing-list" element={
              <ProtectedRoute requiredUserType="mortgage_professional">
                <LmiMarketingList />
              </ProtectedRoute>
            } />
            
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
