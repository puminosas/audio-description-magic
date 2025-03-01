
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';

// Admin pages
import AdminAnalytics from './AdminAnalytics';
import AdminAudioFiles from './AdminAudioFiles';
import AdminUserManagement from './AdminUserManagement';
import AdminUserUpdate from './AdminUserUpdate';
import AdminFeedback from './AdminFeedback';
import AdminSettings from './AdminSettings';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your application and users</p>
        </div>
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <div className="overflow-auto">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="analytics" onClick={() => navigate('/admin')} className="flex-shrink-0">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="audio-files" onClick={() => navigate('/admin/audio-files')} className="flex-shrink-0">
                Audio Files
              </TabsTrigger>
              <TabsTrigger value="users" onClick={() => navigate('/admin/users')} className="flex-shrink-0">
                Users
              </TabsTrigger>
              <TabsTrigger value="user-update" onClick={() => navigate('/admin/user-update')} className="flex-shrink-0">
                Update User
              </TabsTrigger>
              <TabsTrigger value="feedback" onClick={() => navigate('/admin/feedback')} className="flex-shrink-0">
                Feedback
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => navigate('/admin/settings')} className="flex-shrink-0">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <Routes>
            <Route path="/" element={<AdminAnalytics />} />
            <Route path="/audio-files" element={<AdminAudioFiles />} />
            <Route path="/users" element={<AdminUserManagement />} />
            <Route path="/user-update" element={<AdminUserUpdate />} />
            <Route path="/feedback" element={<AdminFeedback />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
