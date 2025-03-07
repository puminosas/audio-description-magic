
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GenerationDataPoint } from '@/hooks/useAnalytics';

interface GenerationChartProps {
  generationData: GenerationDataPoint[];
  timeRange: 'week' | 'month' | 'year';
  setTimeRange: (range: 'week' | 'month' | 'year') => void;
  refreshData: () => void;
}

const GenerationChart: React.FC<GenerationChartProps> = ({
  generationData,
  timeRange,
  setTimeRange,
  refreshData
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Generation Activity</CardTitle>
            <CardDescription>Audio generations over time</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={timeRange} 
              onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refreshData}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {generationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={generationData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} generations`, 'Count']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="count" fill="#10b981" name="Generations" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No generation data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerationChart;
