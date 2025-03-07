
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, ListMusic, MessageSquare, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from '@/hooks/useAnalytics';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminAnalytics = () => {
  const {
    loading,
    stats,
    generationData,
    timeRange,
    setTimeRange,
    refreshData
  } = useAnalytics();

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">{stats.users}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ListMusic className="h-5 w-5 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">{stats.audioFiles}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">{stats.feedback}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Generations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">{stats.generationsToday}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total: {stats.generationsTotal}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Generation Chart */}
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
                        <RechartsBarChart 
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
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No generation data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
