
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import RealtorDashboard from './pages/dashboard/Realtor';
import MortgageProfessionalDashboard from './pages/dashboard/MortgageProfessional';
import MortgageBrokersPage from './pages/admin/MortgageBrokersPage';
import RealtorsPage from './pages/admin/RealtorsPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home Page</div>,
  },
  {
    path: "/login",
    element: <LoginPage />,
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
    element: <div>Admin Dashboard</div>,
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
