
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ProductPage from './pages/ProductPage';
import ResourcesPage from './pages/ResourcesPage';
import PricingPage from './pages/PricingPage';
import CustomersPage from './pages/CustomersPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';

// Admin components
import { AdminLayout, AdminDashboard, MarketingDashboard } from './components/admin';
import AdminTools from './pages/auth/AdminTools';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';

// Client
import ClientDashboard from './pages/dashboard/Client';

// Professional dashboards
import RealtorDashboard from './pages/dashboard/Realtor';
import MortgageProfessionalDashboard from './pages/dashboard/MortgageProfessional';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="marketing" element={<MarketingDashboard />} />
                <Route path="tools" element={<AdminTools />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>

              {/* User dashboard routes */}
              <Route path="/client" element={
                <ProtectedRoute requiredUserType="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/realtor" element={
                <ProtectedRoute requiredUserType="realtor">
                  <RealtorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/mortgage" element={
                <ProtectedRoute requiredUserType="mortgage_professional">
                  <MortgageProfessionalDashboard />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
