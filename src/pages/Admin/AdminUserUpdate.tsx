import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id?: string;
  email: string;
  role: string;
  plan: string;
  daily_limit: number;
  remaining_generations: number;
}

const AdminUserUpdate: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData>({
    email: '',
    role: 'user',
    plan: 'free',
    daily_limit: 10,
    remaining_generations: 10
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // First fetch the user's auth data
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
        
        if (authError) throw authError;
        
        // Then fetch the user's profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;
        
        // Then fetch the user's role data
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') throw roleError;
        
        setUserData({
          id: userId,
          email: authData.user?.email || '',
          role: roleData?.role || 'user',
          plan: profileData?.plan || 'free',
          daily_limit: profileData?.daily_limit || 10,
          remaining_generations: profileData?.remaining_generations || 0
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, toast]);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Update the user's profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: userData.plan,
          daily_limit: userData.daily_limit,
          remaining_generations: userData.remaining_generations
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Update the user's role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingRole) {
        // Update existing role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: userData.role })
          .eq('user_id', userId);
        
        if (roleError) throw roleError;
      } else {
        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: userData.role });
        
        if (roleError) throw roleError;
      }
      
      toast({
        title: 'Success',
        description: 'User data updated successfully',
      });
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit User: {userData.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={userData.role}
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select
                    value={userData.plan}
                    onValueChange={(value) => handleSelectChange('plan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_limit">Daily Limit</Label>
                  <Input
                    id="daily_limit"
                    name="daily_limit"
                    type="number"
                    value={userData.daily_limit}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remaining_generations">Remaining Generations</Label>
                  <Input
                    id="remaining_generations"
                    name="remaining_generations"
                    type="number"
                    value={userData.remaining_generations}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUserUpdate;
