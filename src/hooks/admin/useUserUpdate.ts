
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { changeUserPlan, toggleAdminRole } from '@/services/userManagementService';

export const useUserUpdate = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const { toast } = useToast();

  const searchUser = async () => {
    if (!userId && !email) {
      toast({
        title: 'Error',
        description: 'Please enter either a user ID or email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSearchLoading(true);
      
      let userQuery;
      
      if (email) {
        // Search by email in profiles table
        userQuery = await supabase
          .from('profiles')
          .select('id, plan, email')
          .ilike('email', email)
          .maybeSingle();
      } else {
        // Search by ID
        userQuery = await supabase
          .from('profiles')
          .select('id, plan, email')
          .eq('id', userId)
          .maybeSingle();
      }
      
      if (userQuery.error) throw userQuery.error;
      
      if (userQuery.data) {
        // Check if admin
        const { data: adminData, error: adminError } = await supabase
          .rpc('get_admin_users');
        
        if (adminError) throw adminError;
        
        const adminUsers = adminData || [];
        const isUserAdmin = adminUsers.some(u => u.user_id === userQuery.data.id);
        
        // Set user data
        setUserId(userQuery.data.id);
        setEmail(userQuery.data.email || '');
        setSelectedPlan(userQuery.data.plan || 'free');
        setIsAdmin(isUserAdmin);
        setUserFound(true);
        
        toast({
          title: 'User Found',
          description: `User found with ID: ${userQuery.data.id}`,
        });
      } else {
        setUserFound(false);
        toast({
          title: 'User Not Found',
          description: 'No user found with the provided ID or email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to search user. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleUpdateUser = async () => {
    if (!userFound || !userId) {
      toast({
        title: 'Error',
        description: 'Please search for a valid user first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Update user plan
      await changeUserPlan(userId, selectedPlan);
      
      // Check current admin status to determine if we need to add or remove admin role
      const { data: adminData } = await supabase
        .rpc('get_admin_users');
      
      const adminUsers = adminData || [];
      const userIsCurrentlyAdmin = adminUsers.some(u => u.user_id === userId);
      
      // Only update admin role if it changed
      if (userIsCurrentlyAdmin !== isAdmin) {
        await toggleAdminRole(userId, userIsCurrentlyAdmin);
      }
      
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userId,
    email,
    loading,
    searchLoading,
    selectedPlan,
    isAdmin,
    userFound,
    setUserId,
    setEmail,
    setSelectedPlan,
    setIsAdmin,
    searchUser,
    handleUpdateUser
  };
};
