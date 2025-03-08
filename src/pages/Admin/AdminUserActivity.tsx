import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search } from 'lucide-react';
import UserActivityTable from '@/components/admin/UserActivityTable';
import UserActivityDetails from '@/components/admin/UserActivityDetails';
import UserStatsCards from '@/components/admin/UserStatsCards';
import { 
  fetchAllUsersActivity, 
  getUserActivityDetails, 
  getUserStats,
  UserActivity 
} from '@/services/admin';

const AdminUserActivity = () => {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    registeredUsers: 0,
    anonymousUsers: 0,
    totalGenerations: 0,
    totalFiles: 0
  });
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserRegistered, setSelectedUserRegistered] = useState(false);
  const [selectedUserRegDate, setSelectedUserRegDate] = useState<string | null>(null);
  const [activityDetails, setActivityDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const { toast } = useToast();
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load user statistics
      const statsData = await getUserStats();
      setStats(statsData);
      
      // Load user activity
      const userData = await fetchAllUsersActivity();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Error loading users activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user activity.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search term or filter changes
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(user => {
        const matchesSearch = !searchTerm || 
          (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = userTypeFilter === 'all' || 
          (userTypeFilter === 'registered' && user.is_registered) ||
          (userTypeFilter === 'anonymous' && !user.is_registered);
        
        return matchesSearch && matchesType;
      });
      
      setFilteredUsers(filtered);
    }
  }, [searchTerm, userTypeFilter, users]);

  const handleRefresh = () => {
    loadUsers();
  };

  const handleViewActivity = async (userId: string, isRegistered: boolean) => {
    try {
      setDetailsLoading(true);
      
      // Find user in the list
      const user = users.find(u => u.id === userId);
      if (user) {
        setSelectedUserId(user.id);
        setSelectedUserEmail(user.email);
        setSelectedUserRegistered(user.is_registered);
        setSelectedUserRegDate(user.registration_date);
      } else {
        setSelectedUserId(userId);
        setSelectedUserEmail(null);
        setSelectedUserRegistered(isRegistered);
        setSelectedUserRegDate(null);
      }
      
      // Get activity details
      const details = await getUserActivityDetails(userId, isRegistered);
      setActivityDetails(details || []);
      
      // Open dialog
      setDialogOpen(true);
    } catch (error) {
      console.error('Error loading user activity details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user activity details.',
        variant: 'destructive',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UserStatsCards 
        registeredUsers={stats.registeredUsers}
        anonymousUsers={stats.anonymousUsers}
        totalGenerations={stats.totalGenerations}
        totalFiles={stats.totalFiles}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full md:w-[200px]">
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="registered">Registered Only</SelectItem>
                  <SelectItem value="anonymous">Anonymous Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Users table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <UserActivityTable 
              users={filteredUsers}
              onViewActivity={handleViewActivity}
            />
          )}
        </CardContent>
      </Card>
      
      {/* User activity details dialog */}
      <UserActivityDetails 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={selectedUserId}
        userEmail={selectedUserEmail}
        isRegistered={selectedUserRegistered}
        registrationDate={selectedUserRegDate}
        audioFiles={activityDetails}
        loading={detailsLoading}
      />
    </div>
  );
};

export default AdminUserActivity;
