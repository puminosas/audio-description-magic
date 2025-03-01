
import { supabase } from '@/integrations/supabase/client';
import { convertTemporaryFilesToUserFiles, getOrCreateGuestSessionId } from '@/utils/fileStorageService';

export const fetchUserProfile = async (userId: string) => {
  try {
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
            
          if (insertError) throw insertError;
          return { profile: newProfile, isAdmin: false };
        }
      } else {
        throw profileError;
      }
    } else {
      // Check if admin using the RPC function
      try {
        const { data: isAdminResult, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
        
        if (roleError) throw roleError;
        return { profile: profileData, isAdmin: !!isAdminResult };
      } catch (roleError) {
        console.error('Error checking admin role:', roleError);
        return { profile: profileData, isAdmin: false };
      }
    }
    
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
