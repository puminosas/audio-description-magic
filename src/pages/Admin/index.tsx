import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { assignAdminRole } from '@/utils/supabaseHelper';
import AdminLayout from '@/components/layout/AdminLayout'; // Adjusted to your actual path
import AdminAiChat from '@/components/admin/AdminAiChat'; // Import the AI chat component

// Admin pages
import AdminAnalytics from './AdminAnalytics';
import AdminAudioFiles from './AdminAudioFiles';
import AdminUserManagement from './AdminUserManagement';
import AdminUserUpdate from './AdminUserUpdate';
import AdminUserActivity from './AdminUserActivity';
import AdminFeedback from './AdminFeedback';
import AdminSettings from './AdminSettings';
import AdminAiChatPage from './AdminAiChat';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current tab from path
  const getCurrentTab = () => {
    const path = location.pathname.split('/')[2] || '';
    switch (path) {
      case 'audio-files': return 'audio-files';
      case 'users': return 'users';
      case 'user-update': return 'user-update';
      case 'user-activity': return 'user-activity';
      case 'feedback': return 'feedback';
      case 'ai-chat': return 'ai-chat';
      case 'settings': return 'settings';
      default: return 'analytics';
    }
  };
  
  // Emergency function to ensure the current user has admin access
  // This helps during development and testing
  useEffect(() => {
    const setupCurrentUserAsAdmin = async () => {
      if (user && !isAdmin && !loading) {
        console.log("Attempting to assign admin role to current user:", user.id);
        try {
          // Assign admin role to the current user
          const success = await assignAdminRole(user.id);
          if (success) {
            console.log("Admin role assigned successfully");
            // Force a page reload to refresh the auth context
            window.location.reload();
          }
        } catch (error) {
          console.error("Failed to assign admin role:", error);
        }
      }
    };
    
    setupCurrentUserAsAdmin();
  }, [user, isAdmin, loading]);
  
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

  const handleTabClick = (tab: string) => {
    setMobileMenuOpen(false);
    
    switch (tab) {
      case 'audio-files': navigate('/admin/audio-files'); break;
      case 'users': navigate('/admin/users'); break;
      case 'user-update': navigate('/admin/user-update'); break;
      case 'user-activity': navigate('/admin/user-activity'); break;
      case 'feedback': navigate('/admin/feedback'); break;
      case 'ai-chat': navigate('/admin/ai-chat'); break;
      case 'settings': navigate('/admin/settings'); break;
      default: navigate('/admin'); break;
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 py-8 pt-20 md:pt-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your application and users</p>
            </div>
            
            <Tabs value={getCurrentTab()} className="space-y-6">
              <div className="overflow-auto">
                <TabsList className="flex flex-wrap">
                  <TabsTrigger 
                    value="analytics" 
                    onClick={() => handleTabClick('analytics')} 
                    className="flex-shrink-0"
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="audio-files" 
                    onClick={() => handleTabClick('audio-files')} 
                    className="flex-shrink-0"
                  >
                    Audio Files
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    onClick={() => handleTabClick('users')} 
                    className="flex-shrink-0"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger 
                    value="user-activity" 
                    onClick={() => handleTabClick('user-activity')} 
                    className="flex-shrink-0"
                  >
                    User Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="user-update" 
                    onClick={() => handleTabClick('user-update')} 
                    className="flex-shrink-0"
                  >
                    Update User
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feedback" 
                    onClick={() => handleTabClick('feedback')} 
                    className="flex-shrink-0"
                  >
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ai-chat" 
                    onClick={() => handleTabClick('ai-chat')} 
                    className="flex-shrink-0"
                  >
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    onClick={() => handleTabClick('settings')} 
                    className="flex-shrink-0"
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <Routes>
                <Route path="/" element={<AdminAnalytics />} />
                <Route path="/audio-files" element={<AdminAudioFiles />} />
                <Route path="/users" element={<AdminUserManagement />} />
                <Route path="/user-activity" element={<AdminUserActivity />} />
                <Route path="/user-update" element={<AdminUserUpdate />} />
                <Route path="/feedback" element={<AdminFeedback />} />
                <Route path="/ai-chat" element={<AdminAiChatPage />} />
                <Route path="/settings" element={<AdminSettings />} />
              </Routes>
            </Tabs>
          </div>
        </div>
        
        {/* Add the AI Chat component */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">AI Project Assistant</h2>
          <AdminAiChat />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
