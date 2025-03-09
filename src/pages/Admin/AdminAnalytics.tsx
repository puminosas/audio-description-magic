
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MetricsCards from '@/components/admin/analytics/MetricsCards';
import AnalyticsTabs from '@/components/admin/analytics/AnalyticsTabs';
import { useAnalyticsMetrics } from '@/hooks/admin/useAnalyticsMetrics';

const AdminAnalytics = () => {
  const { metrics, isLoading, fetchMetrics } = useAnalyticsMetrics();
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = () => {
    fetchMetrics();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Analytics Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <AnalyticsTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default AdminAnalytics;
