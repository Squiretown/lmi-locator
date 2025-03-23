
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import ApiDocs from '@/pages/ApiDocs';
import ApiTest from '@/pages/ApiTest';
import NotFound from '@/pages/NotFound';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import MarketingDashboard from '@/components/admin/MarketingDashboard';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/api/docs" element={<ApiDocs />} />
            <Route path="/api/test" element={<ApiTest />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
