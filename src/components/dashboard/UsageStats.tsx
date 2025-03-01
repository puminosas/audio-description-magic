
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UsageStatsProps {
  profile: any;
}

const UsageStats: React.FC<UsageStatsProps> = ({ profile }) => {
  const dailyLimit = profile?.daily_limit || 10;
  const remaining = profile?.remaining_generations || 0;
  const used = dailyLimit - remaining;
  const percentUsed = Math.min(100, Math.max(0, (used / dailyLimit) * 100));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {used} / {dailyLimit} generations used today
            </span>
            <span className="font-medium">{percentUsed.toFixed(0)}%</span>
          </div>
          <Progress value={percentUsed} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStats;
