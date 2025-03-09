
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeSubscription } from './types';

export const useRealtimeSubscription = (onUpdate: () => void) => {
  useEffect(() => {
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_files' },
        () => {
          // Update metrics when new audio files are generated
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'generation_counts' },
        () => {
          // Update metrics when generation counts change
          onUpdate();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
};
