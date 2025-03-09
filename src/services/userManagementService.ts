
import { supabase } from '@/integrations/supabase/client';
import { assignAdminRole, removeAdminRole, updateUserPlan } from '@/utils/supabase/userRoles';

export interface UserData {
  id: string;
  email: string;
  role: string | null;
  plan: string;
  created_at: string;
}

export const fetchUsers = async (page: number, itemsPerPage: number) => {
  try {
    // Get user profiles instead of using admin API
    const startIndex = (page - 1) * itemsPerPage;
    
    // Get user profiles with pagination
    const { data: profiles, error: profilesError, count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(startIndex, startIndex + itemsPerPage - 1);
    
    if (profilesError) throw profilesError;
    
    // Get user roles - use the actual RPC function instead of direct table access
    // Using 'any' to avoid TypeScript errors with custom RPC functions
    const { data: adminUsers, error: adminError } = await supabase
      .rpc('get_admin_users') as any;
    
    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      // Continue without admin data if there's an error
    }
    
    // Create a map of user_id to role
    const roleMap = {};
    if (adminUsers && Array.isArray(adminUsers)) {
      adminUsers.forEach(user => {
        roleMap[user.user_id] = 'admin';
      });
    }
    
    // Map profiles to UserData format
    const users = profiles?.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      role: roleMap[profile.id] || null,
      plan: profile.plan || 'free',
      created_at: profile.created_at
    })) || [];

    return {
      users: users as UserData[],
      totalCount: totalCount || 0
    };
  } catch (error) {
    console.error('Error loading users:', error);
    throw error;
  }
};

export const toggleAdminRole = async (userId: string, isAdmin: boolean) => {
  try {
    if (isAdmin) {
      // Remove admin role
      await removeAdminRole(userId);
    } else {
      // Add admin role
      await assignAdminRole(userId);
    }
    return true;
  } catch (error) {
    console.error('Error toggling admin role:', error);
    throw error;
  }
};

export const changeUserPlan = async (userId: string, plan: string) => {
  try {
    // Ensure plan is one of the allowed values
    const validPlan = (plan === 'free' || plan === 'basic' || plan === 'premium' || plan === 'admin') 
      ? plan as 'free' | 'basic' | 'premium' | 'admin' 
      : 'free';
      
    await updateUserPlan(userId, validPlan);
    return true;
  } catch (error) {
    console.error('Error updating user plan:', error);
    throw error;
  }
};
