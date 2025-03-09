
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveUser {
  id: string;
  email?: string | null;
  isRegistered: boolean;
  lastActive: string;
}

const ActiveUsersCard = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('active-users-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_files' },
        (payload) => {
          // Update active users when new audio files are generated
          fetchActiveUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      
      // Get users active in the last hour
      const hourAgo = new Date();
      hourAgo.setHours(hourAgo.getHours() - 1);
      
      // Get registered users who were active
      const { data: registeredUsers, error: regError } = await supabase
        .from('audio_files')
        .select('user_id, created_at')
        .not('user_id', 'is', null)
        .gt('created_at', hourAgo.toISOString())
        .order('created_at', { ascending: false });
      
      // Get anonymous users who were active
      const { data: anonymousUsers, error: anonError } = await supabase
        .from('audio_files')
        .select('session_id, created_at')
        .is('user_id', null)
        .not('session_id', 'is', null)
        .gt('created_at', hourAgo.toISOString())
        .order('created_at', { ascending: false });
      
      // Process registered users
      const registeredMap = new Map<string, string>();
      registeredUsers?.forEach(item => {
        if (item.user_id && !registeredMap.has(item.user_id)) {
          registeredMap.set(item.user_id, item.created_at);
        }
      });
      
      // Process anonymous users
      const anonymousMap = new Map<string, string>();
      anonymousUsers?.forEach(item => {
        if (item.session_id && !anonymousMap.has(item.session_id)) {
          anonymousMap.set(item.session_id, item.created_at);
        }
      });
      
      // Get profile data for registered users
      const registeredUserIds = Array.from(registeredMap.keys());
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', registeredUserIds);
      
      // Create combined list of active users
      const registeredActiveUsers: ActiveUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        isRegistered: true,
        lastActive: registeredMap.get(profile.id) || new Date().toISOString()
      }));
      
      const anonymousActiveUsers: ActiveUser[] = Array.from(anonymousMap.entries()).map(([id, lastActive]) => ({
        id: id,
        email: null,
        isRegistered: false,
        lastActive: lastActive
      }));
      
      // Combine and sort by most recent activity
      const allActiveUsers = [...registeredActiveUsers, ...anonymousActiveUsers]
        .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
        .slice(0, 10); // Limit to most recent 10 users
      
      setActiveUsers(allActiveUsers);
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currently Active Users</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeUsers.length > 0 ? (
          <ul className="space-y-3">
            {activeUsers.map(user => (
              <li key={user.id} className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center gap-3">
                  {user.isRegistered ? (
                    <UserCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <UserX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    {user.email ? (
                      <p className="text-sm font-medium">{user.email}</p>
                    ) : (
                      <p className="text-sm font-medium text-muted-foreground">Anonymous User</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Last active at {formatTime(user.lastActive)}
                    </p>
                  </div>
                </div>
                <Badge variant={user.isRegistered ? "default" : "outline"}>
                  {user.isRegistered ? "Registered" : "Guest"}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-[200px] flex items-center justify-center flex-col gap-2 text-muted-foreground">
            <p>No active users in the last hour</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveUsersCard;
