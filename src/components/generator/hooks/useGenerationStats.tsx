
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type GenerationStats = {
  total: number;
  today: number;
  remaining: number;
};

export const useGenerationStats = (user: User | null) => {
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats({ total: 0, today: 0, remaining: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Call Supabase to get user generation stats
      const { data, error } = await supabase
        .from('user_stats')
        .select('total_generations, today_generations, remaining_generations')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching generation stats:', error);
        return;
      }

      if (data) {
        setStats({
          total: data.total_generations || 0,
          today: data.today_generations || 0,
          remaining: data.remaining_generations || 10 // Default to 10 if not set
        });
      } else {
        // If no stats exist yet, provide default values
        setStats({ total: 0, today: 0, remaining: 10 });
      }
    } catch (error) {
      console.error('Failed to fetch generation stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch stats on initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Return the stats and a function to refresh them
  return { 
    stats, 
    loading, 
    refreshStats: fetchStats 
  };
};
