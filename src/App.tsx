
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import './App.css';
import Generator from './pages/Generator';
import { AuthProvider } from './context/AuthContext';
import Pricing from './pages/Pricing';
import IntegrationDocs from './pages/IntegrationDocs';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import MainNavbar from './components/layout/MainNavbar';

// Layout component with navbar
const RootLayout = () => {
  return (
    <>
      <MainNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Generator />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/integration-docs",
        element: <IntegrationDocs />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/admin/*",
        element: <Admin />,
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
