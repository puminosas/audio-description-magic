
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricsDataPoint } from './types';

export const useMetricsData = () => {
  const [data, setData] = useState<MetricsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial data load
    generateInitialData();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      updateData();
    }, 30000); // Update every 30 seconds

    // Set up real-time subscription
    const channel = supabase
      .channel('real-time-metrics')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_files' },
        () => {
          // When a new audio file is generated, update the graph
          updateData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const generateInitialData = async () => {
    setIsLoading(true);
    try {
      // Get data for the last 6 hours with 30-minute intervals
      const dataPoints: MetricsDataPoint[] = [];
      const now = new Date();
      
      for (let i = 12; i >= 0; i--) {
        const timePoint = new Date(now);
        timePoint.setMinutes(now.getMinutes() - i * 30);
        const startTime = new Date(timePoint);
        startTime.setMinutes(timePoint.getMinutes() - 30);
        
        // Query generations in this time window
        const { count: generationsCount, error: genError } = await supabase
          .from('audio_files')
          .select('*', { count: 'exact' })
          .gte('created_at', startTime.toISOString())
          .lt('created_at', timePoint.toISOString());
        
        if (genError) {
          console.error('Error fetching generations count:', genError);
        }
        
        // Query unique users in this time window
        const { data: usersData, error: usersError } = await supabase
          .from('audio_files')
          .select('user_id, session_id')
          .gte('created_at', startTime.toISOString())
          .lt('created_at', timePoint.toISOString());
        
        if (usersError) {
          console.error('Error fetching users data:', usersError);
        }
        
        // Count unique users and sessions
        const uniqueUsers = new Set();
        const uniqueSessions = new Set();
        
        usersData?.forEach(item => {
          if (item.user_id) uniqueUsers.add(item.user_id);
          else if (item.session_id) uniqueSessions.add(item.session_id);
        });
        
        dataPoints.push({
          time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          generations: generationsCount || 0,
          users: uniqueUsers.size + uniqueSessions.size
        });
      }
      
      setData(dataPoints);
    } catch (error) {
      console.error('Error generating initial metrics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async () => {
    try {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now);
      thirtyMinutesAgo.setMinutes(now.getMinutes() - 30);
      
      // Get generations in the last 30 minutes
      const { count: generationsCount, error: genError } = await supabase
        .from('audio_files')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyMinutesAgo.toISOString());
      
      if (genError) {
        console.error('Error fetching recent generations count:', genError);
      }
      
      // Get unique users in the last 30 minutes
      const { data: usersData, error: usersError } = await supabase
        .from('audio_files')
        .select('user_id, session_id')
        .gte('created_at', thirtyMinutesAgo.toISOString());
      
      if (usersError) {
        console.error('Error fetching recent users data:', usersError);
      }
      
      // Count unique users and sessions
      const uniqueUsers = new Set();
      const uniqueSessions = new Set();
      
      usersData?.forEach(item => {
        if (item.user_id) uniqueUsers.add(item.user_id);
        else if (item.session_id) uniqueSessions.add(item.session_id);
      });
      
      // Add new data point and remove oldest
      const newData = [...data.slice(1), {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        generations: generationsCount || 0,
        users: uniqueUsers.size + uniqueSessions.size
      }];
      
      setData(newData);
    } catch (error) {
      console.error('Error updating metrics data:', error);
    }
  };

  return { data, isLoading, refreshData: generateInitialData };
};
