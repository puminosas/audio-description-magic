
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';

// Admin role helper - imported directly to avoid dynamic import
import { assignAdminRole } from '@/utils/supabase/userRoles';

// Admin pages
import AdminAudioFiles from './AdminAudioFiles';
import AdminUserManagement from './AdminUserManagement';
import AdminUserUpdate from './AdminUserUpdate';
import AdminUserActivity from './AdminUserActivity';
import AdminFeedback from './AdminFeedback';
import AdminSettings from './AdminSettings';
import AdminAiChatPage from './AdminAiChat';
import AdminPurchases from './AdminPurchases';
import AdminDocumentation from './AdminDocumentation';
import AdminAnalytics from './AdminAnalytics';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Emergency function to ensure the current user has admin access
  useEffect(() => {
    const setupCurrentUserAsAdmin = async () => {
      if (user && !isAdmin && !loading) {
        // Check if the user is a.mackeliunas@gmail.com
        if (user.email === 'a.mackeliunas@gmail.com') {
          console.log("Detected admin email, attempting to assign admin role");
          try {
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
  }, [user, isAdmin, loading, navigate, toast]);
  
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
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/ai-chat" replace />} />
        <Route path="/audio-files" element={<AdminAudioFiles />} />
        <Route path="/users" element={<AdminUserManagement />} />
        <Route path="/user-activity" element={<AdminUserActivity />} />
        <Route path="/user-update" element={<AdminUserUpdate />} />
        <Route path="/purchases" element={<AdminPurchases />} />
        <Route path="/feedback" element={<AdminFeedback />} />
        <Route path="/ai-chat" element={<AdminAiChatPage />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/documentation" element={<AdminDocumentation />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
