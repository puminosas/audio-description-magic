
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsMetrics {
  activeUsers: number;
  todayGenerations: number;
  totalListens: number;
  averageProcessingTime: number;
}

export const useAnalyticsMetrics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    activeUsers: 0,
    todayGenerations: 0,
    totalListens: 0,
    averageProcessingTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Set up real-time subscription for updates
  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_files' },
        () => {
          // Update metrics when new audio files are generated
          fetchMetrics();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'generation_counts' },
        () => {
          // Update metrics when generation counts change
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Get active users (users who generated audio in the last hour)
      const hourAgo = new Date();
      hourAgo.setHours(hourAgo.getHours() - 1);
      
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('audio_files')
        .select('user_id, session_id')
        .gt('created_at', hourAgo.toISOString())
        .not('user_id', 'is', null);
      
      const { data: anonymousUsersData, error: anonymousUsersError } = await supabase
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
      
      // Get today's generations
      const today = new Date().toISOString().split('T')[0];
      const { count: todayGenerationsCount, error: todayGenError } = await supabase
        .from('audio_files')
        .select('*', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00Z`);
      
      // Get total listens (simplified metric - could be replaced with actual listen tracking)
      const { count: totalListensCount, error: listensError } = await supabase
        .from('audio_files')
        .select('*', { count: 'exact' });
      
      // Update metrics state
      setMetrics({
        activeUsers: uniqueUserIds.size + uniqueSessionIds.size,
        todayGenerations: todayGenerationsCount || 0,
        totalListens: totalListensCount || 0,
        averageProcessingTime: 3.2 // Placeholder value - would need real processing time tracking
      });
      
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { metrics, isLoading, fetchMetrics };
};
