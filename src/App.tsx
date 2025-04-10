import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RealtorDashboard from './pages/dashboard/Realtor';
import MortgageProfessionalDashboard from './pages/dashboard/MortgageProfessional';
import AdminPage from './pages/admin/AdminPage';
import UsersPage from './pages/admin/UsersPage';
import PropertiesPage from './pages/admin/PropertiesPage';
import MortgageBrokersPage from './pages/admin/MortgageBrokersPage';
import RealtorsPage from './pages/admin/RealtorsPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/dashboard/realtor",
    element: <RealtorDashboard />,
  },
  {
    path: "/dashboard/mortgage-professional",
    element: <MortgageProfessionalDashboard />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/admin/users",
    element: <UsersPage />,
  },
  {
    path: "/admin/properties",
    element: <PropertiesPage />,
  },
  {
    path: "/admin/mortgage-brokers",
    element: <MortgageBrokersPage />,
  },
  {
    path: "/admin/realtors",
    element: <RealtorsPage />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
