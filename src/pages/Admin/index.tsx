
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

// Import ensureAdminRole directly from adminRoleService
import { ensureAdminRole } from '@/services/profile/adminRoleService';

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
  
  // Function to ensure the current user has admin access
  useEffect(() => {
    const setupCurrentUserAsAdmin = async () => {
      if (user && !loading) {
        // Check if the user is a.mackeliunas@gmail.com
        if (user.email === 'a.mackeliunas@gmail.com') {
          console.log("Detected admin email, ensuring admin access");
          
          try {
            // Try to set admin state directly for quick UI update
            setIsAdmin(true);
            
            // First check if the user already has admin role using RPC
            const { data: hasAdminRole, error: checkError } = await supabase
              .rpc('has_role', { role: 'admin' });
              
            if (checkError) {
              console.error("Error checking admin role:", checkError);
              // Continue to ensure admin role anyway
            } else if (hasAdminRole) {
              console.log("User already has admin role");
              // No need for toast since we already set isAdmin to true
              return;
            }
            
            // Ensure admin role regardless of check result for this email
            const success = await ensureAdminRole(user.id);
            
            if (success) {
              console.log("Admin role assigned successfully");
              // Already set isAdmin to true earlier
              
              toast({
                title: "Admin access granted",
                description: "You now have admin permissions"
              });
            } else {
              console.warn("Could not assign admin role through normal channels");
              
              // Even if the role assignment failed, we'll still treat this email as admin
              // for UI purposes, since it's hardcoded as a special admin email
              // This ensures the user can at least see the admin interface
              
              toast({
                title: "Admin access granted",
                description: "Using backup admin access method"
              });
            }
          } catch (error) {
            console.error("Error ensuring admin access:", error);
            
            // For this special email, still allow UI access even if role assignment failed
            setIsAdmin(true);
            
            toast({
              title: "Limited Admin Access",
              description: "Some admin functions may not work properly",
              variant: "destructive" // Changed from "warning" to "destructive" as that's a valid variant
            });
          }
        } else if (!isAdmin) {
          // Not the admin email and not an admin user
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
  if (!loading && !user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Special case for the admin email - always show admin UI
  const isSpecialAdminEmail = user?.email === 'a.mackeliunas@gmail.com';
  
  // Redirect if not admin and not the special admin email
  if (!loading && !isAdmin && !isSpecialAdminEmail) {
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
