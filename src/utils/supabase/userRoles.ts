
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/utils/supabase/typedClient';

// Helper function to check if a user has admin role
export async function checkIsAdmin(userId: string) {
  try {
    // Use direct query without going through RLS that might cause recursion
    const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
    
    if (error) throw error;
    return !!data; // Convert to boolean - true if admin role exists
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Helper to assign admin role to a user
export async function assignAdminRole(userId: string) {
  try {
    // First check if role already exists using service role client
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (existingRole) {
      // Role already exists, no need to add it again
      return true;
    }
    
    // Insert the admin role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
    
    if (error) throw error;
    
    // Also update the user's plan to 'admin' in the profiles table
    await updateUserPlan(userId, 'admin');
    
    return true;
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return false;
  }
}

// Helper to remove admin role from a user
export async function removeAdminRole(userId: string) {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
}

// Helper to update a user's plan
export async function updateUserPlan(userId: string, plan: 'free' | 'basic' | 'premium' | 'admin') {
  try {
    // Use supabase client for the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        plan,
        updated_at: new Date().toISOString(),
        daily_limit: plan === 'premium' ? 9999 : (plan === 'basic' ? 100 : 10),
        remaining_generations: plan === 'premium' ? 9999 : (plan === 'basic' ? 100 : 10)
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user plan:', error);
    return false;
  }
}

// Helper to modify a user's remaining generations count
export async function updateUserRemainingGenerations(userId: string, count: number) {
  try {
    // Use supabase client for the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        remaining_generations: count,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user remaining generations:', error);
    return false;
  }
}
