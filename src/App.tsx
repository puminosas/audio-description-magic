
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Generator from '@/pages/Generator';
import ApiDocs from '@/pages/ApiDocs';
import ApiClient from '@/pages/ApiClient';
import Pricing from '@/pages/Pricing';
import NotFound from '@/pages/NotFound';
import Admin from '@/pages/Admin';
import '@/App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generator" element={<Generator />} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/api" element={<Navigate to="/api-docs" replace />} />
                <Route path="/api-client" element={<ApiClient />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
