
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a user has the admin role assigned
 * @param userId The ID of the user to assign admin role to
 * @returns Whether the role was successfully assigned
 */
export const ensureAdminRole = async (userId: string): Promise<boolean> => {
  try {
    console.log('Ensuring admin role for user:', userId);
    
    // First ensure the profile is set to admin plan
    // This must be done before checking roles to avoid permission issues
    const profileSuccess = await updateUserProfile(userId);
    
    if (!profileSuccess) {
      console.error('Failed to update user profile to admin plan');
      // Continue execution to try other methods
    }
    
    // Check if the user already has admin role using the RPC function
    const { data: isAdmin, error: checkError } = await supabase
      .rpc('has_role', { role: 'admin' });
      
    if (checkError) {
      console.error('Error checking admin role status:', checkError);
      // Still continue execution to try direct check
    } else if (isAdmin) {
      console.log('User already has admin role');
      return true;
    }
    
    console.log('Adding admin role to user');
    
    // Try to insert the role using a direct query first
    const { error: insertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, { onConflict: 'user_id,role' });
      
    if (insertError) {
      console.error('Error inserting admin role:', insertError);
      
      // Try a second approach with the check_is_admin RPC function
      // This uses SECURITY DEFINER so it bypasses RLS
      const { data: adminCheck, error: adminCheckError } = await supabase
        .rpc('check_is_admin');
        
      if (adminCheckError) {
        console.error('Error calling check_is_admin RPC:', adminCheckError);
        return false;
      }
      
      if (adminCheck) {
        console.log('Admin check succeeded via RPC');
        return true;
      }
      
      return false;
    }
    
    console.log('Admin role successfully assigned');
    return true;
  } catch (e) {
    console.error('Error in ensureAdminRole:', e);
    return false;
  }
};

/**
 * Helper function to update user profile to admin plan
 * Using a separate function to handle failures and retry logic
 */
const updateUserProfile = async (userId: string): Promise<boolean> => {
  try {
    console.log('Updating profile to admin plan for user:', userId);
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing profile:', checkError);
      // Continue to try creating/updating anyway
    }
    
    // If profile doesn't exist or needs updating, use upsert with onConflict parameter
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        plan: 'admin',
        daily_limit: 9999,
        remaining_generations: 9999,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
      
    if (updateError) {
      console.error('Error updating profile to admin plan:', updateError);
      
      // Try again with RPC if available, or other methods if needed
      // This is where you could add additional bypass methods if you create them
      
      return false;
    }
    
    console.log('Profile successfully updated to admin plan');
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
};
