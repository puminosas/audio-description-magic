
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Generator from './pages/Generator';
import ApiClient from './pages/ApiClient';
import ApiDocs from './pages/ApiDocs';
import TextToAudio from './pages/TextToAudio';
import FeedbackPage from './pages/Feedback';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/api-client" element={<ApiClient />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/text-to-audio" element={<TextToAudio />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<Admin />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
