
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/utils/supabase/typedClient';

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
      
      // Get the user profile for remaining generations and daily limit
      const profileResponse = await supabase
        .from('profiles')
        .select('remaining_generations, daily_limit, plan')
        .eq('id', user.id)
        .maybeSingle();
        
      // Get total generations from generation_counts
      const totalCountResponse = await supabase
        .from('generation_counts')
        .select('count')
        .eq('user_id', user.id);
        
      // Get today's generations
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const todayCountResponse = await supabase
        .from('generation_counts')
        .select('count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Calculate total generations
      const totalGenerations = totalCountResponse.data?.reduce(
        (sum, record) => sum + (record.count || 0), 
        0
      ) || 0;
      
      // Get today's generation count
      const todayGenerations = todayCountResponse.data?.count || 0;
      
      // Get remaining generations from profile
      const remaining = profileResponse.data?.remaining_generations || 10; // Default to 10
      
      setStats({
        total: totalGenerations,
        today: todayGenerations,
        remaining: remaining
      });
    } catch (error) {
      console.error('Failed to fetch generation stats:', error);
      // Provide default values if error occurs
      setStats({ total: 0, today: 0, remaining: 10 });
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
