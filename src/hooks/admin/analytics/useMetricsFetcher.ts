
import { supabase } from '@/integrations/supabase/client';

export const fetchActiveUsers = async () => {
  // Get active users (users who generated audio in the last hour)
  const hourAgo = new Date();
  hourAgo.setHours(hourAgo.getHours() - 1);
  
  const { data: activeUsersData } = await supabase
    .from('audio_files')
    .select('user_id, session_id')
    .gt('created_at', hourAgo.toISOString())
    .not('user_id', 'is', null);
  
  const { data: anonymousUsersData } = await supabase
    .from('audio_files')
    .select('session_id')
    .gt('created_at', hourAgo.toISOString())
    .is('user_id', null);
  
  // Get unique users and sessions
  const uniqueUserIds = new Set();
  const uniqueSessionIds = new Set();
  
  activeUsersData?.forEach(item => {
    if (item.user_id) uniqueUserIds.add(item.user_id);
  });
  
  anonymousUsersData?.forEach(item => {
    if (item.session_id) uniqueSessionIds.add(item.session_id);
  });
  
  return uniqueUserIds.size + uniqueSessionIds.size;
};

export const fetchTodayGenerations = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { count: todayGenerationsCount } = await supabase
    .from('audio_files')
    .select('*', { count: 'exact' })
    .gte('created_at', `${today}T00:00:00Z`);
  
  return todayGenerationsCount || 0;
};

export const fetchTotalListens = async () => {
  const { count: totalListensCount } = await supabase
    .from('audio_files')
    .select('*', { count: 'exact' });
  
  return totalListensCount || 0;
};

export const fetchAverageProcessingTime = async () => {
  // This is a placeholder - in a real app, we'd fetch actual processing time data
  return 3.2;
};
