
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveMetricsGraph from './LiveMetricsGraph';
import RecentActivitiesCard from './RecentActivitiesCard';
import SystemLoadCard from './SystemLoadCard';
import ActiveUsersCard from './ActiveUsersCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="generation">Generation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <LiveMetricsGraph />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecentActivitiesCard />
          <SystemLoadCard />
        </div>
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        <ActiveUsersCard />
      </TabsContent>
      
      <TabsContent value="generation" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Generation Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Detailed generation metrics will appear here
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsTabs;
