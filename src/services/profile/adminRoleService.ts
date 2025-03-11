
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a user has the admin role assigned
 * @param userId The ID of the user to assign admin role to
 * @returns Whether the role was successfully assigned
 */
export const ensureAdminRole = async (userId: string): Promise<boolean> => {
  try {
    // First update the profile to admin plan
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        plan: 'admin',
        daily_limit: 9999,
        remaining_generations: 9999,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
    if (profileError) {
      console.error('Error updating profile to admin plan:', profileError);
      return false;
    }
    
    // Check if admin role already exists using direct query
    const { data: existingRole, error: checkError } = await supabase
      .rpc('has_role', { role: 'admin' });
      
    if (checkError) {
      console.error('Error checking admin role:', checkError);
      return false;
    }
    
    // If the role already exists, no need to create it again
    if (existingRole) {
      console.log('User already has admin role');
      return true;
    }
    
    // Insert the admin role without using the user_id in the query
    // This avoids potential RLS issues as we're using RPC functions now
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
      
    if (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }
    
    console.log('Admin role successfully assigned');
    return true;
  } catch (e) {
    console.error('Error in ensureAdminRole:', e);
    return false;
  }
};
