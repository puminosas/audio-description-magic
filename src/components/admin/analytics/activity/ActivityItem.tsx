
import React from 'react';
import { FileAudio2, User, RefreshCw, Clock } from 'lucide-react';
import { ActivityEvent } from './types';

interface ActivityItemProps {
  activity: ActivityEvent;
}

export const getActivityIcon = (type: string) => {
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

export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getUserIdentifier = (activity: ActivityEvent) => {
  if (activity.email) {
    return activity.email;
  } else if (activity.sessionId) {
    return `Session: ${activity.sessionId.substring(0, 8)}...`;
  } else {
    return 'Unknown User';
  }
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  return (
    <li className="flex gap-3 text-sm">
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
  );
};

export default ActivityItem;
