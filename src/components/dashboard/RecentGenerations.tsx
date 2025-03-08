
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import AudioHistoryItem from '@/components/ui/AudioHistoryItem';
import { fetchUserAudios } from '@/utils/audio/historyService';
import { Loader2 } from 'lucide-react';

interface RecentGenerationsProps {
  user: User | null;
}

const RecentGenerations: React.FC<RecentGenerationsProps> = ({ user }) => {
  const [recentAudios, setRecentAudios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudios = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await fetchUserAudios(user.id, 3);
        setRecentAudios(data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching audio history:', error);
        setError('Failed to load recent generations');
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, [user]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Generations</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/generator">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive-foreground">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : recentAudios.length > 0 ? (
          <div className="space-y-4">
            {recentAudios.map((audio) => (
              <AudioHistoryItem 
                key={audio.id}
                id={audio.id}
                audioUrl={audio.audio_url}
                title={audio.title}
                description={audio.description || ''}
                voiceName={audio.voice_name}
                duration={audio.duration || 0}
                createdAt={audio.created_at}
                language={audio.language}
                showControls={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No audio generations yet.</p>
            <Button variant="outline" className="mt-2" asChild>
              <Link to="/generator">Create your first audio</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentGenerations;
