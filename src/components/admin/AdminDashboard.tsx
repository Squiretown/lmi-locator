
import React from 'react';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};

export default AdminDashboard;
