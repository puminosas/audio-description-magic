
import { supabase } from '@/integrations/supabase/client';
import { UserActivity } from './types';

// Fetch all user activities (registered and anonymous)
export const fetchAllUsersActivity = async () => {
  try {
    // Registered users from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at');
    
    if (profilesError) throw profilesError;
    
    // Anonymous users from audio_files
    const { data: anonymousSessions, error: anonymousError } = await supabase
      .from('audio_files')
      .select('session_id, created_at')
      .is('user_id', null)
      .not('session_id', 'is', null);
    
    if (anonymousError) throw anonymousError;
    
    // Get unique anonymous users (by session_id)
    const uniqueSessionIds = new Set();
    const uniqueAnonymous = [];
    
    for (const item of anonymousSessions || []) {
      if (item.session_id && !uniqueSessionIds.has(item.session_id)) {
        uniqueSessionIds.add(item.session_id);
        uniqueAnonymous.push({
          id: item.session_id,
          email: null,
          created_at: item.created_at,
          is_registered: false
        });
      }
    }
    
    // Combine registered and anonymous users
    const allUsers = [
      ...(profiles || []).map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        is_registered: true
      })),
      ...uniqueAnonymous
    ];
    
    // Get activity data for all users
    const enrichedUsers = await Promise.all(
      allUsers.map(async user => {
        // Get audio generations count
        const { count: generationsCount } = await supabase
          .from('audio_files')
          .select('*', { count: 'exact' })
          .eq(user.is_registered ? 'user_id' : 'session_id', user.id);
        
        // Get latest activity
        const { data: latestActivity } = await supabase
          .from('audio_files')
          .select('created_at')
          .eq(user.is_registered ? 'user_id' : 'session_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        return {
          id: user.id,
          email: user.email,
          is_registered: user.is_registered,
          registration_date: user.created_at,
          last_active: latestActivity?.[0]?.created_at || user.created_at,
          total_generations: generationsCount || 0,
          files_count: generationsCount || 0
        };
      })
    );
    
    return enrichedUsers;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Get user activity details
export const getUserActivityDetails = async (userId: string, isRegistered: boolean) => {
  try {
    // Get all audio files for the user
    const { data: audioFiles, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq(isRegistered ? 'user_id' : 'session_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return audioFiles;
  } catch (error) {
    console.error('Error fetching user activity details:', error);
    throw error;
  }
};
