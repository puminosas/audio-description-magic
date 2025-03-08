
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ListMusic, MessageSquare, BarChart } from 'lucide-react';
import { AnalyticsData } from '@/hooks/useAnalytics';

interface StatsCardsProps {
  stats: AnalyticsData;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
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
          <div className="text-xs text-muted-foreground mt-1">
            Registered: {stats.registeredUsers || 0}
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
          <div className="text-xs text-muted-foreground mt-1">
            Today: {stats.todayAudioFiles || 0}
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
          <div className="text-xs text-muted-foreground mt-1">
            Pending: {stats.pendingFeedback || 0}
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
  );
};

export default StatsCards;
