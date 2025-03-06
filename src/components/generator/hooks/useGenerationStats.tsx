
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserGenerationStats } from '@/utils/audio';

export interface GenerationStats {
  total: number;
  today: number;
  remaining: number;
}

export const useGenerationStats = () => {
  const { user, profile } = useAuth();
  const [generationStats, setGenerationStats] = useState<GenerationStats>({ 
    total: 0, 
    today: 0,
    remaining: profile?.remaining_generations || 10
  });

  const fetchGenerationStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const stats = await getUserGenerationStats(user.id);
      setGenerationStats({
        total: stats.totalGenerations || 0,
        today: stats.recentGenerations?.length || 0,
        remaining: profile?.remaining_generations || 10
      });
    } catch (error) {
      console.error("Error fetching generation stats:", error);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user?.id) {
      fetchGenerationStats();
    }
  }, [user, fetchGenerationStats]);

  return {
    generationStats,
    fetchGenerationStats
  };
};
