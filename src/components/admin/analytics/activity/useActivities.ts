
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityEvent } from './types';

export const useActivities = () => {
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
      
      // Get all unique user IDs to fetch user profiles in bulk
      const userIds = audioFiles?.filter(file => file.user_id).map(file => file.user_id) || [];
      
      // Fetch all profiles in a single query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
      }
      
      // Create a map of user IDs to emails for quick lookup
      const userEmailMap = new Map();
      profiles?.forEach(profile => {
        if (profile.id) {
          userEmailMap.set(profile.id, profile.email);
        }
      });
      
      // Process audio files to activity events
      for (const file of audioFiles || []) {
        let email = null;
        let isRegistered = false;
        
        // Get user email for registered users
        if (file.user_id) {
          isRegistered = true;
          email = userEmailMap.get(file.user_id);
          
          // If email wasn't found in the bulk fetch, try to get it directly
          if (!email) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', file.user_id)
              .single();
            
            if (profile) {
              email = profile.email;
            }
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

  return { activities, loading, fetchRecentActivities };
};
