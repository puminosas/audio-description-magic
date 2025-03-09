
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const SystemLoadCard = () => {
  const [cpuLoad, setCpuLoad] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [apiLatency, setApiLatency] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading system metrics
    const loadInitialData = () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Set random initial values (in a real app, these would come from backend monitoring)
        setCpuLoad(Math.floor(Math.random() * 35) + 15); // 15-50% range
        setMemoryUsage(Math.floor(Math.random() * 40) + 30); // 30-70% range
        setApiLatency(Math.floor(Math.random() * 200) + 100); // 100-300ms range
        
        setLoading(false);
      }, 1000);
    };
    
    loadInitialData();
    
    // Update metrics periodically
    const interval = setInterval(() => {
      // Vary the values slightly to simulate real-time changes
      setCpuLoad(prev => {
        const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
        const newValue = prev + variation;
        return Math.max(5, Math.min(95, newValue)); // Keep between 5-95%
      });
      
      setMemoryUsage(prev => {
        const variation = Math.floor(Math.random() * 8) - 4; // -4 to +4
        const newValue = prev + variation;
        return Math.max(10, Math.min(90, newValue)); // Keep between 10-90%
      });
      
      setApiLatency(prev => {
        const variation = Math.floor(Math.random() * 40) - 20; // -20 to +20
        const newValue = prev + variation;
        return Math.max(50, Math.min(500, newValue)); // Keep between 50-500ms
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>System Load</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Load</span>
                <span className="text-sm font-medium">{cpuLoad}%</span>
              </div>
              <Progress 
                value={cpuLoad} 
                className={`h-2 ${cpuLoad > 70 ? 'bg-red-100' : 'bg-secondary'}`}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm font-medium">{memoryUsage}%</span>
              </div>
              <Progress 
                value={memoryUsage} 
                className={`h-2 ${memoryUsage > 80 ? 'bg-red-100' : 'bg-secondary'}`}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Latency</span>
                <span className="text-sm font-medium">{apiLatency}ms</span>
              </div>
              <Progress 
                value={Math.min(100, apiLatency / 5)} // Scale: 0-500ms maps to 0-100%
                className={`h-2 ${apiLatency > 300 ? 'bg-red-100' : 'bg-secondary'}`}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemLoadCard;
