
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  Users, 
  FileAudio2, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveMetricsGraph from '@/components/admin/analytics/LiveMetricsGraph';
import ActiveUsersCard from '@/components/admin/analytics/ActiveUsersCard';
import RecentActivitiesCard from '@/components/admin/analytics/RecentActivitiesCard';
import SystemLoadCard from '@/components/admin/analytics/SystemLoadCard';

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    todayGenerations: 0,
    totalListens: 0,
    averageProcessingTime: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch initial metrics
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Set up real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_files' },
        (payload) => {
          // Update metrics when new audio files are generated
          fetchMetrics();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'generation_counts' },
        (payload) => {
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
        .is('user_id', null, { negated: true });
      
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
  
  const handleRefresh = () => {
    fetchMetrics();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Analytics Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users active in the last hour
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Generations</CardTitle>
            <FileAudio2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayGenerations}</div>
            <p className="text-xs text-muted-foreground">
              Audio files generated today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listens</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalListens}</div>
            <p className="text-xs text-muted-foreground">
              Cumulative audio plays
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageProcessingTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average audio generation time
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <LiveMetricsGraph />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecentActivitiesCard />
            <SystemLoadCard />
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <ActiveUsersCard />
        </TabsContent>
        
        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Detailed generation metrics will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
