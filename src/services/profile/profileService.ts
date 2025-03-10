
import { supabase } from '@/integrations/supabase/client';
import { ensureAdminRole } from './adminRoleService';

/**
 * Fetches a user's profile from the database
 * @param userId The ID of the user to fetch the profile for
 * @returns The user's profile and admin status
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Get the user's auth data first
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const isAdminEmail = authUser?.email === 'a.mackeliunas@gmail.com';
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);
      
      // If profile doesn't exist, try to create one
      if (profileError.code === 'PGRST116' && userId) {
        return await createNewProfile(userId, authUser, isAdminEmail);
      } else {
        throw profileError;
      }
    } 
    
    // Profile exists, handle admin status if needed
    if (profileData) {
      console.log('Profile found for user:', userId);
      
      if (isAdminEmail && profileData.plan !== 'admin') {
        await updateToAdminPlan(userId, profileData);
      }
      
      // Check if user is admin
      return await checkAdminStatus(userId, profileData, isAdminEmail);
    }
    
    console.log('No profile data found and no new profile created for user:', userId);
    return { profile: null, isAdmin: false };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, isAdmin: false };
  }
};

/**
 * Creates a new profile for a user
 */
const createNewProfile = async (userId: string, authUser: any, isAdminEmail: boolean) => {
  console.log('Profile not found, creating one for user:', userId);
  
  // For the specific admin email, always create with admin plan
  const planType = isAdminEmail ? 'admin' : 'free';
  const dailyLimit = isAdminEmail ? 9999 : 10;
  
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      plan: planType,
      daily_limit: dailyLimit,
      email: authUser?.email,
      remaining_generations: dailyLimit
    })
    .select('*')
    .single();
    
  if (insertError) {
    console.error('Error creating profile:', insertError);
    throw insertError;
  }
  
  console.log('Created new profile for user:', userId, 'with plan:', planType);
  
  // If admin email, also ensure admin role is assigned
  if (isAdminEmail) {
    await ensureAdminRole(userId);
  }
  
  return { profile: newProfile, isAdmin: isAdminEmail };
};

/**
 * Updates a user's profile to the admin plan
 */
const updateToAdminPlan = async (userId: string, profileData: any) => {
  // Update to admin plan if needed
  await supabase
    .from('profiles')
    .update({
      plan: 'admin',
      daily_limit: 9999,
      remaining_generations: 9999,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
    
  profileData.plan = 'admin';
  profileData.daily_limit = 9999;
  profileData.remaining_generations = 9999;
  
  await ensureAdminRole(userId);
};

/**
 * Checks if a user has admin status
 */
const checkAdminStatus = async (userId: string, profileData: any, isAdminEmail: boolean) => {
  try {
    const { data: isAdminResult, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
    
    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return { profile: profileData, isAdmin: isAdminEmail };
    }
    
    // If should be admin but role check fails, force role assignment
    if (isAdminEmail && !isAdminResult) {
      await ensureAdminRole(userId);
      return { profile: profileData, isAdmin: true };
    }
    
    console.log('Admin check result:', isAdminResult);
    return { profile: profileData, isAdmin: !!isAdminResult };
  } catch (roleError) {
    console.error('Error checking admin role:', roleError);
    return { profile: profileData, isAdmin: isAdminEmail };
  }
};
