
import { useEffect, useState } from 'react';
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
import TextToAudioPage from '@/pages/TextToAudio';
import ApiDocs from '@/pages/ApiDocs';
import ApiClient from '@/pages/ApiClient';
import Pricing from '@/pages/Pricing';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import Admin from '@/pages/Admin';
import '@/App.css';
import { initializeGoogleVoices } from '@/utils/audio';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [voicesInitialized, setVoicesInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize Google TTS voices data when the app starts
    const preloadServices = async () => {
      try {
        if (!voicesInitialized) {
          // Pre-fetch Google TTS voices data
          await initializeGoogleVoices();
          setVoicesInitialized(true);
          // Clear any previous error since initialization succeeded
          setInitError(null);
          
          console.log('Google TTS voices initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        setInitError(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    preloadServices();
  }, [voicesInitialized]);

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
                <Route path="/text-to-audio" element={<TextToAudioPage />} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/api" element={<Navigate to="/api-docs" replace />} />
                <Route path="/api-client" element={<ApiClient />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
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
