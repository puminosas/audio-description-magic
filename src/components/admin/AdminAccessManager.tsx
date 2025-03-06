
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';

interface AdminAccessManagerProps {
  children: React.ReactNode;
}

const AdminAccessManager: React.FC<AdminAccessManagerProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useApiErrorHandler();
  
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
            handleError(error);
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
  }, [user, isAdmin, loading, navigate, handleError, toast]);
  
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
  
  // Render children if user is admin
  return <>{children}</>;
};

export default AdminAccessManager;
