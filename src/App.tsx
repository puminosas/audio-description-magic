
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
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
