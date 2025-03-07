
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { changeUserPlan, toggleAdminRole } from '@/services/userManagementService';

const AdminUserUpdate = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const { toast } = useToast();

  const searchUser = async () => {
    if (!userId && !email) {
      toast({
        title: 'Error',
        description: 'Please enter either a user ID or email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSearchLoading(true);
      
      let userQuery;
      
      if (email) {
        // Search by email in profiles table
        userQuery = await supabase
          .from('profiles')
          .select('id, plan, email')
          .ilike('email', email)
          .maybeSingle();
      } else {
        // Search by ID
        userQuery = await supabase
          .from('profiles')
          .select('id, plan, email')
          .eq('id', userId)
          .maybeSingle();
      }
      
      if (userQuery.error) throw userQuery.error;
      
      if (userQuery.data) {
        // Check if admin
        const { data: adminData, error: adminError } = await supabase
          .rpc('get_admin_users');
        
        if (adminError) throw adminError;
        
        const adminUsers = adminData || [];
        const isUserAdmin = adminUsers.some(u => u.user_id === userQuery.data.id);
        
        // Set user data
        setUserId(userQuery.data.id);
        setEmail(userQuery.data.email || '');
        setSelectedPlan(userQuery.data.plan || 'free');
        setIsAdmin(isUserAdmin);
        setUserFound(true);
        
        toast({
          title: 'User Found',
          description: `User found with ID: ${userQuery.data.id}`,
        });
      } else {
        setUserFound(false);
        toast({
          title: 'User Not Found',
          description: 'No user found with the provided ID or email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to search user. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleUpdateUser = async () => {
    if (!userFound || !userId) {
      toast({
        title: 'Error',
        description: 'Please search for a valid user first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Update user plan
      await changeUserPlan(userId, selectedPlan);
      
      // Check current admin status to determine if we need to add or remove admin role
      const { data: adminData } = await supabase
        .rpc('get_admin_users');
      
      const adminUsers = adminData || [];
      const userIsCurrentlyAdmin = adminUsers.some(u => u.user_id === userId);
      
      // Only update admin role if it changed
      if (userIsCurrentlyAdmin !== isAdmin) {
        await toggleAdminRole(userId, userIsCurrentlyAdmin);
      }
      
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium">User ID</label>
            <Input
              id="userId"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Or Email</label>
            <Input
              id="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button onClick={searchUser} disabled={searchLoading}>
            {searchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Search User
          </Button>
        </div>
        
        {/* Update Form - only show if user is found */}
        {userFound && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Update User Details</h3>
            
            <div className="space-y-2">
              <label htmlFor="userEmail" className="text-sm font-medium">Email</label>
              <Input id="userEmail" value={email} disabled />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="plan" className="text-sm font-medium">Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isAdmin" className="text-sm font-medium">Admin User</label>
            </div>
            
            <Button onClick={handleUpdateUser} disabled={loading} className="mt-4">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserUpdate;
