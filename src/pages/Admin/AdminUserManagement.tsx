
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  PenSquare, 
  Shield, 
  User, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  daily_limit: number;
  remaining_generations: number;
  created_at: string;
  isAdmin?: boolean;
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [newDailyLimit, setNewDailyLimit] = useState('');
  const [newRemainingGenerations, setNewRemainingGenerations] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      setTotalUsers(count || 0);
      setTotalPages(Math.ceil((count || 0) / usersPerPage));

      // Fetch users for current page
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .range((page - 1) * usersPerPage, page * usersPerPage - 1)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Fetch admin roles
      const { data: adminData, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminError) throw adminError;

      // Combine user data with admin status
      const adminIds = adminData?.map(admin => admin.user_id) || [];
      const usersWithAdminStatus = userData?.map(user => ({
        ...user,
        isAdmin: adminIds.includes(user.id)
      })) || [];

      setUsers(usersWithAdminStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPlan(user.plan);
    setNewDailyLimit(user.daily_limit.toString());
    setNewRemainingGenerations(user.remaining_generations.toString());
    setEditDialogOpen(true);
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: newPlan,
          daily_limit: parseInt(newDailyLimit),
          remaining_generations: parseInt(newRemainingGenerations)
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });

      // Refresh user list
      fetchUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Admin status ${isCurrentlyAdmin ? 'removed' : 'granted'}.`,
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportUsers = () => {
    // Create CSV content
    const headers = ['ID', 'Email', 'Name', 'Plan', 'Daily Limit', 'Remaining', 'Created', 'Admin'];
    const csvRows = [headers.join(',')];
    
    users.forEach(user => {
      const row = [
        user.id,
        user.email,
        user.full_name || '',
        user.plan,
        user.daily_limit,
        user.remaining_generations,
        formatDate(user.created_at),
        user.isAdmin ? 'Yes' : 'No'
      ];
      
      // Escape values that contain commas
      const escapedRow = row.map(value => {
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      
      csvRows.push(escapedRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden md:table-cell">Limit</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.plan === 'premium' ? 'default' : user.plan === 'basic' ? 'secondary' : 'outline'}>
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.remaining_generations} / {user.daily_limit}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.isAdmin ? 'Admin' : 'User'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.isAdmin ? 'ghost' : 'ghost'}
                          size="icon"
                          onClick={() => toggleAdminStatus(user.id, !!user.isAdmin)}
                          disabled={user.id === currentUser?.id} // Prevent changing own admin status
                        >
                          {user.isAdmin ? (
                            <User className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * usersPerPage + 1}-{Math.min(page * usersPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user settings and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label className="text-right">Email</Label>
                <div className="col-span-3 font-medium">{selectedUser.email}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="plan" className="text-right">Plan</Label>
                <Select
                  value={newPlan}
                  onValueChange={setNewPlan}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="daily-limit" className="text-right">Daily Limit</Label>
                <Input
                  id="daily-limit"
                  className="col-span-3"
                  type="number"
                  value={newDailyLimit}
                  onChange={(e) => setNewDailyLimit(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="remaining" className="text-right">Remaining</Label>
                <Input
                  id="remaining"
                  className="col-span-3"
                  type="number"
                  value={newRemainingGenerations}
                  onChange={(e) => setNewRemainingGenerations(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
