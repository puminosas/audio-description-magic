
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DataPoint {
  time: string;
  generations: number;
  users: number;
}

const LiveMetricsGraph = () => {
  const [data, setData] = useState<DataPoint[]>([]);
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
        (payload) => {
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
      const dataPoints: DataPoint[] = [];
      const now = new Date();
      
      for (let i = 12; i >= 0; i--) {
        const timePoint = new Date(now);
        timePoint.setMinutes(now.getMinutes() - i * 30);
        const startTime = new Date(timePoint);
        startTime.setMinutes(timePoint.getMinutes() - 30);
        
        // Query generations in this time window
        const { count: generationsCount } = await supabase
          .from('audio_files')
          .select('*', { count: 'exact' })
          .gte('created_at', startTime.toISOString())
          .lt('created_at', timePoint.toISOString());
        
        // Query unique users in this time window
        const { data: usersData } = await supabase
          .from('audio_files')
          .select('user_id, session_id')
          .gte('created_at', startTime.toISOString())
          .lt('created_at', timePoint.toISOString());
        
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
      const { count: generationsCount } = await supabase
        .from('audio_files')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyMinutesAgo.toISOString());
      
      // Get unique users in the last 30 minutes
      const { data: usersData } = await supabase
        .from('audio_files')
        .select('user_id, session_id')
        .gte('created_at', thirtyMinutesAgo.toISOString());
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="generations" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Audio Generations"
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#82ca9d" 
                name="Active Users" 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveMetricsGraph;
