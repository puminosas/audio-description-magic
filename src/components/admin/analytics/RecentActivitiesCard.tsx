
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import ActivityList from './activity/ActivityList';
import { useActivities } from './activity/useActivities';

const RecentActivitiesCard = () => {
  const { activities, loading, fetchRecentActivities } = useActivities();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Activities</CardTitle>
        <button 
          onClick={fetchRecentActivities} 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <ActivityList activities={activities} loading={loading} />
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesCard;
