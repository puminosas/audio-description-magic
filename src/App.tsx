
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './context/AuthContext';

import Index from './pages/Index';
import Auth from './pages/Auth';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import ApiDocs from './pages/ApiDocs';
import NotFound from './pages/NotFound';
import NavbarComponent from './components/layout/navbar/NavbarComponent';
import Footer from './components/layout/Footer';
import AdminDashboard from './pages/Admin';
import ApiClient from './pages/ApiClient';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <NavbarComponent />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/generate" element={<Generator />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/api-docs" element={<ApiDocs />} />
                  <Route path="/api-client" element={<ApiClient />} />
                  <Route path="/admin/*" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
              <Toaster />
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
