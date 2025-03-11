
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a user has the admin role assigned
 * @param userId The ID of the user to assign admin role to
 * @returns Whether the role was successfully assigned
 */
export const ensureAdminRole = async (userId: string): Promise<boolean> => {
  try {
    console.log('Ensuring admin role for user:', userId);
    
    // First check if the user already has admin role using RPC function
    const { data: isAdmin, error: checkError } = await supabase
      .rpc('has_role', { role: 'admin' });
      
    if (checkError) {
      console.error('Error checking admin role status:', checkError);
      // Continue execution to try other methods
    } else if (isAdmin) {
      console.log('User already has admin role');
      
      // Still update the profile to make sure it has admin plan
      await updateUserProfile(userId);
      return true;
    }
    
    // User doesn't have admin role, insert it
    console.log('Adding admin role to user');
    
    // Try to directly insert the role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
      
    if (error) {
      console.error('Error inserting admin role:', error);
      
      // Try using check_is_admin RPC function which bypasses RLS
      const { data: adminCheckResult, error: adminCheckError } = await supabase
        .rpc('check_is_admin');
        
      if (adminCheckError) {
        console.error('Error calling check_is_admin:', adminCheckError);
        return false;
      }
      
      console.log('Admin status check result:', adminCheckResult);
      
      // If admin check succeeded but role insertion failed, 
      // we can assume the user already has role or now gained access
      if (adminCheckResult) {
        await updateUserProfile(userId);
        return true;
      }
      
      return false;
    }
    
    // Update the user profile after role has been successfully assigned
    await updateUserProfile(userId);
    
    console.log('Admin role successfully assigned');
    return true;
  } catch (e) {
    console.error('Error in ensureAdminRole:', e);
    return false;
  }
};

/**
 * Helper function to update user profile to admin plan
 */
const updateUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        plan: 'admin',
        daily_limit: 9999,
        remaining_generations: 9999,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
    if (error) {
      console.error('Error updating profile to admin plan:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
};
