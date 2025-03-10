
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

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
  const { user, isAdmin, loading, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Emergency function to ensure the current user has admin access
  useEffect(() => {
    const setupCurrentUserAsAdmin = async () => {
      if (user && !loading) {
        // Check if the user is a.mackeliunas@gmail.com
        if (user.email === 'a.mackeliunas@gmail.com') {
          console.log("Detected admin email, ensuring admin access");
          
          try {
            // First, ensure the user has an admin role in user_roles table
            const { error: roleError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: user.id,
                role: 'admin'
              }, { onConflict: 'user_id,role' });
              
            if (roleError) {
              console.error("Failed to upsert user role:", roleError);
              // Try alternate method
              const success = await assignAdminRole(user.id);
              
              if (success) {
                console.log("Admin role assigned via helper function");
                setIsAdmin(true);
              } else {
                throw new Error("Failed to assign admin role via helper function");
              }
            } else {
              console.log("Admin role set via direct upsert");
              setIsAdmin(true);
            }
            
            // Next, ensure the profile has admin plan
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                plan: 'admin',
                daily_limit: 9999,
                remaining_generations: 9999,
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
              
            if (profileError) {
              console.error("Failed to update profile to admin:", profileError);
            } else {
              console.log("Profile updated to admin plan");
            }
            
            // Show success toast only if user wasn't already admin
            if (!isAdmin) {
              toast({
                title: "Admin access ensured",
                description: "You now have admin permissions"
              });
            }
          } catch (error) {
            console.error("Error ensuring admin access:", error);
            toast({
              title: "Admin Setup Error",
              description: "There was a problem setting up admin access. Please try refreshing the page.",
              variant: "destructive"
            });
          }
        } else if (!isAdmin) {
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
  }, [user, isAdmin, loading, navigate, toast, setIsAdmin]);
  
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
