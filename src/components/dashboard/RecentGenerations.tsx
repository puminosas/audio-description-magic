
import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AudioHistoryItem from '@/components/ui/AudioHistoryItem';
import { fetchUserAudioHistory } from '@/utils/audio/historyService';

interface RecentGenerationsProps {
  user: User | null;
}

const RecentGenerations: React.FC<RecentGenerationsProps> = ({ user }) => {
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { audioFiles } = await fetchUserAudioHistory(user.id, 5);
        setRecentItems(audioFiles || []);
      } catch (error) {
        console.error('Error loading recent generations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user?.id]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Recent Generations</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/generator?tab=history">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : recentItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              You haven't generated any audio yet.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/generator">Create Your First Audio</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {recentItems.map((item) => (
              <div key={item.id} className="p-4">
                <AudioHistoryItem 
                  item={item} 
                  showControls={true} 
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentGenerations;
