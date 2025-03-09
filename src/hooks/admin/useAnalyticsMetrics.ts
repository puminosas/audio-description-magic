
import { useState, useEffect, useCallback } from 'react';
import { AnalyticsMetrics } from './analytics/types';
import { 
  fetchActiveUsers, 
  fetchTodayGenerations, 
  fetchTotalListens,
  fetchAverageProcessingTime
} from './analytics/useMetricsFetcher';
import { useRealtimeSubscription } from './analytics/useRealtimeSubscription';

export { AnalyticsMetrics };

export const useAnalyticsMetrics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    activeUsers: 0,
    todayGenerations: 0,
    totalListens: 0,
    averageProcessingTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all metrics in parallel
      const [
        activeUsers,
        todayGenerations,
        totalListens,
        averageProcessingTime
      ] = await Promise.all([
        fetchActiveUsers(),
        fetchTodayGenerations(),
        fetchTotalListens(),
        fetchAverageProcessingTime()
      ]);
      
      // Update metrics state
      setMetrics({
        activeUsers,
        todayGenerations,
        totalListens,
        averageProcessingTime
      });
      
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Set up realtime subscription
  useRealtimeSubscription(fetchMetrics);

  return { metrics, isLoading, fetchMetrics };
};
