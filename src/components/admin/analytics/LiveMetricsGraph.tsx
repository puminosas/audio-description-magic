
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useMetricsData } from './metrics/useMetricsData';
import MetricsChart from './metrics/MetricsChart';
import LoadingSpinner from './metrics/LoadingSpinner';

const LiveMetricsGraph: React.FC = () => {
  const { data, isLoading, refreshData } = useMetricsData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Real-time Activity</CardTitle>
        <button 
          onClick={refreshData} 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <MetricsChart data={data} />
        )}
      </CardContent>
    </Card>
  );
};

export default LiveMetricsGraph;
