
import React from 'react';
import ActivityItem from './ActivityItem';
import { ActivityEvent } from './types';

interface ActivityListProps {
  activities: ActivityEvent[];
  loading: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No recent activities
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </ul>
  );
};

export default ActivityList;
