
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped, assignAdminRole, removeAdminRole, updateUserPlan } from '@/utils/supabaseHelper';
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  ShieldX, 
  Crown, 
  UserCog 
} from 'lucide-react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: itemsPerPage
      });
      
      if (authError) throw authError;
      
      // Get total user count
      const { data: { count }, error: countError } = await supabase.auth.admin.listUsers();
      
      if (countError) throw countError;
      
      setTotalCount(count || 0);
      
      // Get user roles
      const { data: roles, error: rolesError } = await supabaseTyped.user_roles.select();
      
      if (rolesError) throw rolesError;
      
      // Create a map of user_id to roles
      const roleMap = {};
      roles?.forEach(role => {
        roleMap[role.user_id] = role.role;
      });
      
      setUserRoles(roleMap);
      
      // Get user profiles
      const { data: profiles, error: profilesError } = await supabaseTyped.profiles.select();
      
      if (profilesError) throw profilesError;
      
      // Create a map of user_id to profile
      const profileMap = {};
      profiles?.forEach(profile => {
        profileMap[profile.id] = profile;
      });
      
      // Combine user data with roles and profiles
      const enrichedUsers = authUsers.map(user => ({
        ...user,
        role: roleMap[user.id] || null,
        plan: profileMap[user.id]?.plan || 'free'
      }));
      
      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        // Remove admin role
        await removeAdminRole(userId);
      } else {
        // Add admin role
        await assignAdminRole(userId);
      }
      
      // Update the user list
      await loadUsers();
      
      toast({
        title: 'Success',
        description: `User ${isAdmin ? 'removed from' : 'added to'} admin role.`,
      });
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId, plan) => {
    try {
      setLoading(true);
      
      await updateUserPlan(userId, plan);
      
      // Update the user list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, plan } : user
      ));
      
      toast({
        title: 'Success',
        description: `User plan updated to ${plan}.`,
      });
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user plan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = !filterPlan || user.plan === filterPlan;
    
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-4">
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
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={loadUsers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isAdmin = user.role === 'admin';
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell className="font-mono text-xs truncate max-w-[120px]">
                          {user.id}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.plan}
                            onValueChange={(value) => handleUpdatePlan(user.id, value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isAdmin ? 'default' : 'outline'}>
                            {isAdmin ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {isAdmin ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleAdmin(user.id, true)}
                              >
                                <ShieldX className="h-4 w-4 text-destructive" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleAdmin(user.id, false)}
                              >
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * itemsPerPage + 1, totalCount)} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} users
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page * itemsPerPage >= totalCount}
                onClick={() => setPage(page => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUserManagement;
