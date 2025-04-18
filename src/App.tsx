
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
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import { AdminLayout, AdminDashboard, MarketingDashboard } from './components/admin';
import AdminTools from './pages/auth/AdminTools';
import UserManagement from './pages/auth/UserManagement';
import SettingsPage from './pages/auth/SettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from '@/providers/AuthProvider';
import ClientDashboard from './pages/dashboard/Client';
import RealtorDashboard from './pages/dashboard/Realtor';
import MortgageProfessionalDashboard from './pages/dashboard/MortgageProfessional';
import MortgageBrokersPage from './pages/admin/MortgageBrokersPage';
import RealtorsPage from './pages/admin/RealtorsPage';
import SearchHistoryPage from './pages/admin/search-history';
import PropertyChecker from './components/PropertyChecker';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/property-checker" element={<PropertyChecker />} />
              <Route path="/lmi-search" element={
                <ProtectedRoute requiredUserType="mortgage_professional">
                  <div className="container mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold mb-6">LMI Area Listings Search</h1>
                    <p className="text-muted-foreground mb-8">This feature is coming soon.</p>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="marketing" element={<MarketingDashboard />} />
                <Route path="tools" element={<AdminTools />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="mortgage-brokers" element={<MortgageBrokersPage />} />
                <Route path="realtors" element={<RealtorsPage />} />
                <Route path="search-history" element={<SearchHistoryPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>

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
