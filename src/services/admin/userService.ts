
import { supabase } from '@/integrations/supabase/client';
import { UserActivity, UserStatsData } from './types';

// Fetch all registered users
export const fetchRegisteredUsers = async () => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return profiles;
  } catch (error) {
    console.error('Error fetching registered users:', error);
    throw error;
  }
};

// Fetch anonymous users (based on session_id)
export const fetchAnonymousUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('audio_files')
      .select('session_id, created_at')
      .is('user_id', null)
      .not('session_id', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Group by session_id to get unique anonymous users
    const uniqueSessions = [];
    const seenSessionIds = new Set();
    
    for (const item of data || []) {
      if (item.session_id && !seenSessionIds.has(item.session_id)) {
        seenSessionIds.add(item.session_id);
        uniqueSessions.push(item);
      }
    }
    
    return uniqueSessions;
  } catch (error) {
    console.error('Error fetching anonymous users:', error);
    throw error;
  }
};

// Get overall user statistics
export const getUserStats = async (): Promise<UserStatsData> => {
  try {
    // Get registered users count
    const { count: registeredCount, error: regError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (regError) throw regError;
    
    // Get anonymous users count (by unique session_id)
    const { data: anonymousSessions, error: anonError } = await supabase
      .from('audio_files')
      .select('session_id')
      .is('user_id', null)
      .not('session_id', 'is', null);
    
    if (anonError) throw anonError;
    
    const uniqueSessionIds = new Set();
    (anonymousSessions || []).forEach(item => {
      if (item.session_id) uniqueSessionIds.add(item.session_id);
    });
    
    // Get total generations count
    const { count: totalGenerations, error: genError } = await supabase
      .from('audio_files')
      .select('*', { count: 'exact' });
    
    if (genError) throw genError;
    
    return {
      registeredUsers: registeredCount || 0,
      anonymousUsers: uniqueSessionIds.size,
      totalGenerations: totalGenerations || 0,
      totalFiles: totalGenerations || 0
    };
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};
