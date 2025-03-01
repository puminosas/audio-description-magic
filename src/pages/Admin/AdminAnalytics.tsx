
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseTyped } from '@/utils/supabaseHelper';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, ListMusic, MessageSquare, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    audioFiles: 0,
    feedback: 0,
    generationsToday: 0,
    generationsTotal: 0
  });
  const [timeRange, setTimeRange] = useState('week');
  const [generationData, setGenerationData] = useState([]);
  
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get user count
      const { count: userCount } = await supabaseTyped.profiles
        .count({ exact: true });
      
      // Get audio files count
      const { count: audioCount } = await supabaseTyped.audio_files
        .count({ exact: true });
      
      // Get feedback count
      const { count: feedbackCount, error: feedbackError } = await supabaseTyped.feedback
        .count({ exact: true });
      
      if (feedbackError) throw feedbackError;
      
      // Get today's generations
      const today = new Date().toISOString().split('T')[0];
      const { data: todayGenerations, error: todayError } = await supabaseTyped.generation_counts
        .eq('date', today)
        .select('count');
      
      if (todayError) throw todayError;
      
      const generationsToday = todayGenerations?.reduce((sum, item) => sum + item.count, 0) || 0;
      
      // Get total generations
      const { data: allGenerations, error: allError } = await supabaseTyped.generation_counts
        .select('count');
      
      if (allError) throw allError;
      
      const generationsTotal = allGenerations?.reduce((sum, item) => sum + item.count, 0) || 0;
      
      setStats({
        users: userCount || 0,
        audioFiles: audioCount || 0,
        feedback: feedbackCount || 0,
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
  };

  const loadChartData = async (range) => {
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
      const dateMap = new Map();
      
      // Initialize all dates in the range with zero counts
      const dateIterator = new Date(startDate);
      while (dateIterator <= endDate) {
        const dateString = dateIterator.toISOString().split('T')[0];
        dateMap.set(dateString, { date: dateString, count: 0 });
        dateIterator.setDate(dateIterator.getDate() + 1);
      }
      
      // Add counts from database
      data?.forEach(item => {
        const dateKey = item.date;
        if (dateMap.has(dateKey)) {
          const existing = dateMap.get(dateKey);
          dateMap.set(dateKey, { 
            ...existing, 
            count: (existing.count || 0) + item.count 
          });
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
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadChartData(timeRange);
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.users}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ListMusic className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.audioFiles}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.feedback}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today's Generations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.generationsToday}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total: {stats.generationsTotal}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Generation Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Generation Activity</CardTitle>
                  <CardDescription>Audio generations over time</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => loadChartData(timeRange)}>
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {generationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} generations`, 'Count']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey="count" fill="#8884d8" name="Generations" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No generation data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
