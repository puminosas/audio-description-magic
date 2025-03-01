
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
    // Get users from auth
    const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: itemsPerPage
    });
    
    if (authError) throw authError;
    
    const authUsers = authResponse?.users || [];
    
    // Get total count
    const { data: allUsers, error: allUsersError } = await supabase.auth.admin.listUsers();
    if (allUsersError) throw allUsersError;
    
    const totalCount = allUsers?.users?.length || 0;
    
    // Get user roles using the correct approach to avoid recursion
    // We'll check each user individually using our RPC function
    const roleMap = {};
    for (const user of authUsers) {
      // Using a more direct approach to avoid RLS issues
      const { data: hasAdminRole } = await supabase.rpc('has_role', { role: 'admin' });
      if (hasAdminRole) {
        roleMap[user.id] = 'admin';
      }
    }
    
    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) throw profilesError;
    
    // Create a map of user_id to profile
    const profileMap = {};
    profiles?.forEach(profile => {
      profileMap[profile.id] = profile;
    });
    
    // Combine user data with roles and profiles
    const enrichedUsers = authUsers.map(user => ({
      ...user,
      role: roleMap[user.id] || null,
      plan: profileMap[user.id]?.plan || 'free',
      email: user.email || ''
    }));

    return {
      users: enrichedUsers as UserData[],
      totalCount
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
