
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
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              plan: 'admin',
              daily_limit: 9999,
              remaining_generations: 9999
            })
            .select('*')
            .single();
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
          
          console.log('Created new profile for user:', userId);
          
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
            return { profile: newProfile, isAdmin: false };
          }
        }
      } else {
        throw profileError;
      }
    } else {
      console.log('Profile found for user:', userId);
      
      // Check if admin using the RPC function
      try {
        const { data: isAdminResult, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
        
        if (roleError) {
          console.error('Error checking admin role:', roleError);
          throw roleError;
        }
        
        console.log('Admin check result:', isAdminResult);
        return { profile: profileData, isAdmin: !!isAdminResult };
      } catch (roleError) {
        console.error('Error checking admin role:', roleError);
        return { profile: profileData, isAdmin: false };
      }
    }
    
    console.log('No profile data found and no new profile created for user:', userId);
    return { profile: null, isAdmin: false };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, isAdmin: false };
  }
};

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
