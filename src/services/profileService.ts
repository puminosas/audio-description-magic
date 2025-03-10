import { supabase } from '@/integrations/supabase/client';
import { convertTemporaryFilesToUserFiles, getOrCreateGuestSessionId } from '@/utils/fileStorageService';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Use the normal supabase client directly
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);
      // If profile doesn't exist, create one with admin plan for the specified user
      if (profileError.code === 'PGRST116') {
        if (userId) {
          console.log('Profile not found, creating one for user:', userId);
          
          // For the specific admin email, always create with admin plan
          const isAdminEmail = await checkIfAdminEmail(userId);
          const planType = isAdminEmail ? 'admin' : 'free';
          const dailyLimit = isAdminEmail ? 9999 : 10;
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              plan: planType,
              daily_limit: dailyLimit,
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
          
          // Check if admin using the RPC function
          try {
            const { data: isAdminResult, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
            
            if (roleError) {
              console.error('Error checking admin role:', roleError);
              throw roleError;
            }
            
            console.log('Admin check result:', isAdminResult);
            return { profile: newProfile, isAdmin: !!isAdminResult };
          } catch (roleError) {
            console.error('Error checking admin role:', roleError);
            return { profile: newProfile, isAdmin: isAdminEmail }; // Fallback to email check
          }
        }
      } else {
        throw profileError;
      }
    } else {
      console.log('Profile found for user:', userId);
      
      // Check if admin email and ensure proper role
      const isAdminEmail = await checkIfAdminEmail(userId);
      if (isAdminEmail && profileData && profileData.plan !== 'admin') {
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
          
        // Refresh profile data
        profileData.plan = 'admin';
        profileData.daily_limit = 9999;
        profileData.remaining_generations = 9999;
        
        await ensureAdminRole(userId);
      }
      
      // Check if admin using the RPC function
      try {
        const { data: isAdminResult, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
        
        if (roleError) {
          console.error('Error checking admin role:', roleError);
          throw roleError;
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
        return { profile: profileData, isAdmin: isAdminEmail }; // Fallback to email check
      }
    }
    
    console.log('No profile data found and no new profile created for user:', userId);
    return { profile: null, isAdmin: false };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, isAdmin: false };
  }
};

// Helper to check if the user has the admin email
async function checkIfAdminEmail(userId: string): Promise<boolean> {
  try {
    // Instead of trying to access the auth table directly, use the auth API
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && user.id === userId) {
      return user.email === 'a.mackeliunas@gmail.com';
    }
    
    // Fallback method: get the user from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (profile?.email === 'a.mackeliunas@gmail.com') {
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error checking admin email:', e);
    // Final fallback: check current auth session
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email === 'a.mackeliunas@gmail.com';
    } catch {
      return false;
    }
  }
}

// Helper to ensure admin role is assigned
async function ensureAdminRole(userId: string): Promise<boolean> {
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
}

export const handleUserAuthentication = async (userId: string) => {
  // Convert any temporary files for this newly authenticated user
  const sessionId = getOrCreateGuestSessionId();
  try {
    await convertTemporaryFilesToUserFiles(userId, sessionId);
    console.log('Temporary files converted to user files on login');
    return true;
  } catch (error) {
    console.error('Error converting temporary files:', error);
    return false;
  }
};
