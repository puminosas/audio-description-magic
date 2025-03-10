
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a user has the admin role assigned
 * @param userId The ID of the user to assign admin role to
 * @returns Whether the role was successfully assigned
 */
export const ensureAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, { onConflict: 'user_id,role' });
      
    if (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error in ensureAdminRole:', e);
    return false;
  }
};
