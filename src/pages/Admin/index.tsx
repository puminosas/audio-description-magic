
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUserManagement from "./AdminUserManagement";
import AdminAudioFiles from "./AdminAudioFiles";
import AdminFeedback from "./AdminFeedback";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { checkIsAdmin } from '@/utils/supabaseHelper';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        toast({
          title: "Authentication Required",
          description: "You must be logged in to access the admin dashboard.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const adminStatus = await checkIsAdmin(user.id);
      setIsAdmin(adminStatus);
      setLoading(false);

      if (!adminStatus) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    checkAdmin();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="ml-2 text-lg">Verifying admin access...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Already redirected by the useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, content, and system settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-muted/40 p-1 rounded-lg">
          <TabsList className="grid grid-cols-5 w-full mb-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="audio">Audio Files</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Files</CardTitle>
              <CardDescription>
                View and manage all audio files in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAudioFiles />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                System analytics and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>
                Review and manage user feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminFeedback />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system settings and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
