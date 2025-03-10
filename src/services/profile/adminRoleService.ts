
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a user has the admin role assigned
 * @param userId The ID of the user to assign admin role to
 * @returns Whether the role was successfully assigned
 */
export const ensureAdminRole = async (userId: string): Promise<boolean> => {
  try {
    // Check if role already exists to avoid unnecessary operations
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing admin role:', checkError);
      return false;
    }
    
    // If the role already exists, no need to create it again
    if (existingRole) {
      return true;
    }
    
    // Insert the admin role directly without using RLS
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
    
    // Also update the profile to admin plan
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
      // Role assignment succeeded but profile update failed
      return true;
    }
    
    return true;
  } catch (e) {
    console.error('Error in ensureAdminRole:', e);
    return false;
  }
};
