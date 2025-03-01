
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileAudio, 
  Settings,
  Loader2,
  Search,
  MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminUserManagement from './AdminUserManagement';
import AdminAudioFiles from './AdminAudioFiles';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import AdminFeedback from './AdminFeedback';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalAudioFiles: 0,
    premiumUsers: 0,
    basicUsers: 0,
    freeUsers: 0,
    totalGenerations: 0,
    feedbackCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!isAdmin || loading) return;
      
      try {
        // Fetch total users
        const { count: totalUsers, error: usersError } = await supabaseTyped.profiles.select()
          .count('exact', { head: true });

        if (usersError) throw usersError;

        // Fetch plan distribution
        const { data: premiumData, error: premiumError } = await supabaseTyped.profiles.select()
          .eq('plan', 'premium');

        if (premiumError) throw premiumError;

        const { data: basicData, error: basicError } = await supabaseTyped.profiles.select()
          .eq('plan', 'basic');

        if (basicError) throw basicError;

        // Fetch total audio files
        const { count: totalAudioFiles, error: audioError } = await supabaseTyped.audio_files.select()
          .count('exact', { head: true });

        // Fetch feedback count
        const { count: feedbackCount, error: feedbackError } = await supabaseTyped.feedback.select()
          .count('exact', { head: true });

        // Fetch total generations
        const { data: genData, error: genError } = await supabaseTyped.generation_counts.select();

        if (genError) throw genError;

        setDashboardData({
          totalUsers: totalUsers || 0,
          totalAudioFiles: totalAudioFiles || 0,
          premiumUsers: premiumData?.length || 0,
          basicUsers: basicData?.length || 0,
          freeUsers: (totalUsers || 0) - (premiumData?.length || 0) - (basicData?.length || 0),
          totalGenerations: genData?.reduce((acc: number, item: any) => acc + (item.count || 0), 0) || 0,
          feedbackCount: feedbackCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics.',
          variant: 'destructive',
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [isAdmin, loading, toast]);

  // If not admin, redirect to home
  if (!loading && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Audio Files</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="text-2xl font-bold">{dashboardData.totalAudioFiles}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="text-2xl font-bold">{dashboardData.premiumUsers}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feedback Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="text-2xl font-bold">{dashboardData.feedbackCount}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="grid md:w-auto w-full grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="audio-files" className="flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                <span className="hidden md:inline">Audio Files</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden md:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex w-[240px] relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-8"
              />
            </div>
          </div>

          <TabsContent value="users" className="space-y-4">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="audio-files" className="space-y-4">
            <AdminAudioFiles />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <AdminFeedback />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
