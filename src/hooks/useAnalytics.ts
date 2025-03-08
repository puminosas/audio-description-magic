
import { useState, useEffect, useCallback } from 'react';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  users: number;
  registeredUsers: number;
  audioFiles: number;
  todayAudioFiles: number;
  feedback: number;
  pendingFeedback: number;
  generationsToday: number;
  generationsTotal: number;
}

export interface GenerationDataPoint {
  date: string;
  label: string;
  count: number;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsData>({
    users: 0,
    registeredUsers: 0,
    audioFiles: 0,
    todayAudioFiles: 0,
    feedback: 0,
    pendingFeedback: 0,
    generationsToday: 0,
    generationsTotal: 0
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [generationData, setGenerationData] = useState<GenerationDataPoint[]>([]);
  const { toast } = useToast();
  
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get registered user count
      const { data: profileData, error: profileError } = await supabaseTyped.profiles.select();
      if (profileError) throw profileError;
      const registeredUserCount = profileData?.length || 0;
      
      // Get audio files count
      const { data: audioData, error: audioError } = await supabaseTyped.audio_files.select();
      if (audioError) throw audioError;
      const audioCount = audioData?.length || 0;
      
      // Get today's audio files count
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAudioData, error: todayAudioError } = await supabase
        .from('audio_files')
        .select('id')
        .gte('created_at', today);
      
      if (todayAudioError) throw todayAudioError;
      const todayAudioCount = todayAudioData?.length || 0;
      
      // Get feedback count and pending feedback
      const { data: feedbackData, error: feedbackError } = await supabaseTyped.feedback.select();
      if (feedbackError) throw feedbackError;
      const feedbackCount = feedbackData?.length || 0;
      
      // Get pending feedback (status = 'new' or status = 'in_progress')
      const pendingFeedbackCount = feedbackData?.filter(
        item => item.status === 'new' || item.status === 'in_progress'
      ).length || 0;
      
      // Get today's generations
      const { data: todayGenerations, error: todayError } = await supabaseTyped.generation_counts
        .eq('date', today)
        .select();
      
      if (todayError) throw todayError;
      
      const generationsToday = todayGenerations?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
      
      // Get total generations
      const { data: allGenerations, error: allError } = await supabaseTyped.generation_counts
        .select();
      
      if (allError) throw allError;
      
      const generationsTotal = allGenerations?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
      
      // Get anonymous users from audio files with unique session_ids but no user_id
      const { data: anonymousData, error: anonymousError } = await supabase
        .from('audio_files')
        .select('session_id')
        .is('user_id', null)
        .not('session_id', 'is', null);
      
      if (anonymousError) throw anonymousError;
      
      // Count unique session_ids
      const uniqueSessionIds = new Set();
      anonymousData?.forEach(item => {
        if (item.session_id) uniqueSessionIds.add(item.session_id);
      });
      const anonymousUserCount = uniqueSessionIds.size;
      
      // Total users (registered + anonymous)
      const totalUsers = registeredUserCount + anonymousUserCount;
      
      setStats({
        users: totalUsers,
        registeredUsers: registeredUserCount,
        audioFiles: audioCount,
        todayAudioFiles: todayAudioCount,
        feedback: feedbackCount,
        pendingFeedback: pendingFeedbackCount,
        generationsToday,
        generationsTotal
      });
      
      // Load chart data
      await loadChartData(timeRange);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  const loadChartData = useCallback(async (range: 'week' | 'month' | 'year') => {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      // Set the date range
      if (range === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (range === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (range === 'year') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }
      
      // Format dates for database query
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      // Get generation counts within date range
      const { data, error } = await supabaseTyped.custom
        .from('generation_counts')
        .select('date, count')
        .gte('date', startDateString)
        .lte('date', endDateString)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Prepare data for chart
      const dateMap = new Map<string, GenerationDataPoint>();
      
      // Initialize all dates in the range with zero counts
      const dateIterator = new Date(startDate);
      while (dateIterator <= endDate) {
        const dateString = dateIterator.toISOString().split('T')[0];
        dateMap.set(dateString, { date: dateString, label: dateString, count: 0 });
        dateIterator.setDate(dateIterator.getDate() + 1);
      }
      
      // Add counts from database
      data?.forEach(item => {
        const dateKey = item.date;
        if (dateMap.has(dateKey)) {
          const existing = dateMap.get(dateKey);
          if (existing) {
            dateMap.set(dateKey, { 
              ...existing, 
              count: (existing.count || 0) + item.count 
            });
          }
        }
      });
      
      // Convert map to array for the chart
      const chartData = Array.from(dateMap.values());
      
      // Format date labels for display
      chartData.forEach(item => {
        const date = new Date(item.date);
        if (range === 'week') {
          item.label = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (range === 'month') {
          item.label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          item.label = date.toLocaleDateString('en-US', { month: 'short' });
        }
      });
      
      setGenerationData(chartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chart data.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Initialize data on component mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh chart data when timeRange changes
  useEffect(() => {
    loadChartData(timeRange);
  }, [timeRange, loadChartData]);

  return {
    loading,
    stats,
    generationData,
    timeRange,
    setTimeRange,
    refreshData: loadStats
  };
}
