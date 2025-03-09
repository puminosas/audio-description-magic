
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio2, RefreshCw, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityEvent {
  id: string;
  type: 'generation' | 'login' | 'system';
  userId?: string | null;
  email?: string | null;
  description: string;
  timestamp: string;
  isRegistered: boolean;
  sessionId?: string | null;
}

const RecentActivitiesCard = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('recent-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_files' },
        (payload: any) => {
          // Add new generation event
          handleNewGenerationEvent(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      
      // Get recent audio generations
      const { data: audioFiles, error: audioError } = await supabase
        .from('audio_files')
        .select('id, user_id, session_id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (audioError) {
        console.error('Error fetching audio files:', audioError);
        return;
      }
      
      // Convert to activity events
      const generationEvents: ActivityEvent[] = [];
      
      // Process audio files to activity events
      for (const file of audioFiles || []) {
        let email = null;
        let isRegistered = false;
        
        // Get user email for registered users
        if (file.user_id) {
          isRegistered = true;
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', file.user_id)
            .single();
          
          if (profile) {
            email = profile.email;
          }
        }
        
        generationEvents.push({
          id: file.id,
          type: 'generation',
          userId: file.user_id,
          sessionId: file.session_id,
          email,
          isRegistered,
          description: `Generated audio: ${file.title || 'Untitled'}`,
          timestamp: file.created_at
        });
      }
      
      // Sort by timestamp (most recent first)
      const sortedEvents = generationEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
      
      setActivities(sortedEvents);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewGenerationEvent = async (newFile: any) => {
    try {
      let email = null;
      let isRegistered = false;
      
      // Get user email for registered users
      if (newFile.user_id) {
        isRegistered = true;
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', newFile.user_id)
          .single();
        
        if (profile) {
          email = profile.email;
        }
      }
      
      // Create new activity event
      const newEvent: ActivityEvent = {
        id: newFile.id,
        type: 'generation',
        userId: newFile.user_id,
        sessionId: newFile.session_id,
        email,
        isRegistered,
        description: `Generated audio: ${newFile.title || 'Untitled'}`,
        timestamp: newFile.created_at
      };
      
      // Add to existing activities
      setActivities(prevActivities => {
        const updated = [newEvent, ...prevActivities].slice(0, 10);
        return updated;
      });
    } catch (error) {
      console.error('Error processing new generation event:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'generation':
        return <FileAudio2 className="h-4 w-4 text-green-500" />;
      case 'login':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'system':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to display user identifier
  const getUserIdentifier = (activity: ActivityEvent) => {
    if (activity.email) {
      return activity.email;
    } else if (activity.sessionId) {
      return `Session: ${activity.sessionId.substring(0, 8)}...`;
    } else {
      return 'Unknown User';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length > 0 ? (
          <ul className="space-y-3">
            {activities.map(activity => (
              <li key={activity.id} className="flex gap-3 text-sm">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {getUserIdentifier(activity)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{activity.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No recent activities
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesCard;
