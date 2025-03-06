
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
import ErrorBoundary from './components/error/ErrorBoundary';
import ErrorPage from './components/error/ErrorPage';
import { Toaster } from "@/components/ui/toaster";

// Layout component with navbar
const RootLayout = () => {
  return (
    <>
      <MainNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Toaster />
    </>
  );
};

// Error handler function for analytics/logging
const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Global error caught:', error);
  
  // In production, you might want to log to a service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Generator />,
        errorElement: <ErrorPage />
      },
      {
        path: "/pricing",
        element: <Pricing />,
        errorElement: <ErrorPage />
      },
      {
        path: "/integration-docs",
        element: <IntegrationDocs />,
        errorElement: <ErrorPage />
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
        errorElement: <ErrorPage />
      },
      {
        path: "/admin/*",
        element: <Admin />,
        errorElement: <ErrorPage />
      }
    ]
  }
]);

function App() {
  return (
    <ErrorBoundary onError={handleAppError}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
