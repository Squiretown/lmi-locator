
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFound from './pages/NotFound';
import SettingsPage from './pages/auth/SettingsPage';
import UserManagement from './pages/auth/UserManagement';
import AdminTools from './pages/auth/AdminTools';
import Client from './pages/dashboard/Client';
import LmiMarketingList from './pages/dashboard/LmiMarketingList';
import MortgageProfessional from './pages/dashboard/MortgageProfessional';
import Realtor from './pages/dashboard/Realtor';
import ContactPage from './pages/ContactPage';
import ResourcesPage from './pages/ResourcesPage';
import CustomerPage from './pages/CustomersPage';
import BlogPage from './pages/BlogPage';
import PricingPage from './pages/PricingPage';
import ProductPage from './pages/ProductPage';
import AdminDashboard from './components/admin/AdminDashboard';
import MortgageBrokersPage from './pages/admin/MortgageBrokersPage';
import RealtorsPage from './pages/admin/RealtorsPage';
import ContactsPage from './pages/admin/ContactsPage';
import SearchHistoryPage from './pages/admin/search-history/SearchHistoryPage';
import { MarketingDashboard } from './components/admin/marketing-dashboard';
import BulkSearch from './pages/dashboard/BulkSearch';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster closeButton position="top-center" />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/admin-tools" element={<AdminTools />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/dashboard/client" element={<Client />} />
          <Route path="/dashboard/mortgage" element={<MortgageProfessional />} />
          <Route path="/dashboard/realtor" element={<Realtor />} />
          <Route path="/marketing" element={<LmiMarketingList />} />
          <Route path="/bulk-search" element={<BulkSearch />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/marketing" element={<MarketingDashboard />} />
          <Route path="/admin/brokers" element={<MortgageBrokersPage />} />
          <Route path="/admin/realtors" element={<RealtorsPage />} />
          <Route path="/admin/contacts" element={<ContactsPage />} />
          <Route path="/admin/search-history" element={<SearchHistoryPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
