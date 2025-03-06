
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';

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
  useEffect(() => {
    const setupCurrentUserAsAdmin = async () => {
      if (user && !isAdmin && !loading) {
        // Check if the user is a.mackeliunas@gmail.com
        if (user.email === 'a.mackeliunas@gmail.com') {
          console.log("Detected admin email, attempting to assign admin role");
          try {
            // Import helper function dynamically to avoid circular dependencies
            const { assignAdminRole } = await import('@/utils/supabaseHelper');
            const success = await assignAdminRole(user.id);
            
            if (success) {
              console.log("Admin role assigned successfully");
              toast({
                title: "Admin access granted",
                description: "You now have admin permissions"
              });
              // Force a page reload to refresh the auth context
              window.location.reload();
            }
          } catch (error) {
            console.error("Failed to assign admin role:", error);
          }
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions",
            variant: "destructive"
          });
          // Redirect with a slight delay to ensure toast is shown
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    };
    
    setupCurrentUserAsAdmin();
  }, [user, isAdmin, loading, navigate]);
  
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
    </AdminLayout>
  );
};

export default Admin;
