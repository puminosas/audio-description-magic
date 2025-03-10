
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchUsers, toggleAdminRole, changeUserPlan, UserData } from '@/services/userManagementService';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { users: fetchedUsers, totalCount: total } = await fetchUsers(page, itemsPerPage);
      setUsers(fetchedUsers);
      setTotalCount(total);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. You may not have admin permissions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      setLoading(true);
      await toggleAdminRole(userId, isAdmin);
      
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

  const handleUpdatePlan = async (userId: string, plan: string) => {
    try {
      setLoading(true);
      
      await changeUserPlan(userId, plan);
      
      // Update the user list in state
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
    
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    
    return matchesSearch && matchesPlan;
  });

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    filterPlan,
    setFilterPlan,
    page,
    setPage,
    totalCount,
    itemsPerPage,
    handleToggleAdmin,
    handleUpdatePlan,
    loadUsers
  };
};
