
import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import StatsCards from './StatsCards';
import GenerationChart from './GenerationChart';
import LoadingSpinner from './LoadingSpinner';

const AnalyticsContainer: React.FC = () => {
  const {
    loading,
    stats,
    generationData,
    timeRange,
    setTimeRange,
    refreshData
  } = useAnalytics();

  return (
    <div className="space-y-6">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <StatsCards stats={stats} />
          <GenerationChart 
            generationData={generationData}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            refreshData={refreshData}
          />
        </>
      )}
    </div>
  );
};

export default AnalyticsContainer;
