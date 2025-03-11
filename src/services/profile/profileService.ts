
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
    
    // Check if admin email - if so, set as admin in state regardless of database
    if (isAdminEmail) {
      console.log('Admin email detected, preferring admin role');
    }
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);
      
      // If profile doesn't exist, try to create one
      if ((profileError.code === 'PGRST116' || profileError.message?.includes('Results contain 0 rows')) && userId) {
        return await createNewProfile(userId, authUser, isAdminEmail);
      } else {
        // For other errors, if admin email, still return admin status
        if (isAdminEmail) {
          return { 
            profile: {
              id: userId,
              plan: 'admin',
              daily_limit: 9999,
              remaining_generations: 9999
            }, 
            isAdmin: true 
          };
        }
        throw profileError;
      }
    } 
    
    // Profile exists, handle admin status if needed
    if (profileData) {
      console.log('Profile found for user:', userId);
      
      if (isAdminEmail && profileData.plan !== 'admin') {
        // Try to update to admin plan, but don't fail if it doesn't work
        try {
          await updateToAdminPlan(userId, profileData);
        } catch (e) {
          console.error('Error updating to admin plan, continuing with existing profile:', e);
        }
      }
      
      // For admin email, always return isAdmin true regardless of check
      if (isAdminEmail) {
        return { profile: profileData, isAdmin: true };
      }
      
      // For non-admin emails, check admin status
      return await checkAdminStatus(userId, profileData, isAdminEmail);
    }
    
    console.log('No profile data found and no new profile created for user:', userId);
    
    // Last fallback for admin email
    if (isAdminEmail) {
      return { 
        profile: {
          id: userId,
          plan: 'admin',
          daily_limit: 9999,
          remaining_generations: 9999
        }, 
        isAdmin: true 
      };
    }
    
    return { profile: null, isAdmin: false };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Special handling for admin email even on error
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const isAdminEmail = authUser?.email === 'a.mackeliunas@gmail.com';
    
    if (isAdminEmail) {
      return { 
        profile: {
          id: userId,
          plan: 'admin',
          daily_limit: 9999,
          remaining_generations: 9999
        }, 
        isAdmin: true 
      };
    }
    
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
  
  try {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        plan: planType,
        daily_limit: dailyLimit,
        email: authUser?.email,
        remaining_generations: dailyLimit
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('*')
      .single();
      
    if (insertError) {
      console.error('Error creating profile:', insertError);
      
      // For admin email, return admin status even if profile creation failed
      if (isAdminEmail) {
        return { 
          profile: {
            id: userId,
            plan: 'admin',
            daily_limit: 9999,
            email: authUser?.email,
            remaining_generations: 9999
          }, 
          isAdmin: true 
        };
      }
      
      throw insertError;
    }
    
    console.log('Created new profile for user:', userId, 'with plan:', planType);
    
    // If admin email, also ensure admin role is assigned
    if (isAdminEmail) {
      try {
        await ensureAdminRole(userId);
      } catch (e) {
        console.error('Error ensuring admin role after profile creation:', e);
        // Continue anyway for admin email
      }
    }
    
    return { profile: newProfile, isAdmin: isAdminEmail };
  } catch (error) {
    console.error('Error in createNewProfile:', error);
    
    // For admin email, still return admin status on error
    if (isAdminEmail) {
      return { 
        profile: {
          id: userId,
          plan: 'admin',
          daily_limit: 9999,
          email: authUser?.email,
          remaining_generations: 9999
        }, 
        isAdmin: true 
      };
    }
    
    throw error;
  }
};

/**
 * Updates a user's profile to the admin plan
 */
const updateToAdminPlan = async (userId: string, profileData: any) => {
  try {
    // Update to admin plan if needed
    const { error } = await supabase
      .from('profiles')
      .update({
        plan: 'admin',
        daily_limit: 9999,
        remaining_generations: 9999,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating to admin plan:', error);
      throw error;
    }
      
    profileData.plan = 'admin';
    profileData.daily_limit = 9999;
    profileData.remaining_generations = 9999;
    
    await ensureAdminRole(userId);
  } catch (error) {
    console.error('Error in updateToAdminPlan:', error);
    throw error;
  }
};

/**
 * Checks if a user has admin status
 */
const checkAdminStatus = async (userId: string, profileData: any, isAdminEmail: boolean) => {
  try {
    // For admin email, don't even check role - just return true
    if (isAdminEmail) {
      return { profile: profileData, isAdmin: true };
    }
    
    const { data: isAdminResult, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
    
    if (roleError) {
      console.error('Error checking admin role:', roleError);
      
      // For admin email fallback
      if (isAdminEmail) {
        return { profile: profileData, isAdmin: true };
      }
      
      return { profile: profileData, isAdmin: false };
    }
    
    // If should be admin but role check fails, force role assignment
    if (isAdminEmail && !isAdminResult) {
      try {
        await ensureAdminRole(userId);
        return { profile: profileData, isAdmin: true };
      } catch (e) {
        console.error('Error ensuring admin role:', e);
        // Still return true for admin email
        return { profile: profileData, isAdmin: true };
      }
    }
    
    console.log('Admin check result:', isAdminResult);
    return { profile: profileData, isAdmin: !!isAdminResult };
  } catch (roleError) {
    console.error('Error checking admin role:', roleError);
    
    // Fallback for admin email
    if (isAdminEmail) {
      return { profile: profileData, isAdmin: true };
    }
    
    return { profile: profileData, isAdmin: false };
  }
};
