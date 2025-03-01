
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { assignAdminRole, updateUserPlan, updateUserRemainingGenerations } from '@/utils/supabaseHelper';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminUserUpdate = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('a.mackeliunas@gmail.com');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Effect to automatically update the user when the component mounts
  useEffect(() => {
    handleAssignPermissions();
  }, []);
  
  const handleAssignPermissions = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      
      // Get the user from Supabase
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (userError) {
        throw new Error(`Error fetching user: ${userError.message}`);
      }
      
      if (!users) {
        // If not found in profiles, try to find the user in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
          perPage: 1000
        });
        
        if (authError) {
          throw new Error(`Error fetching users: ${authError.message}`);
        }
        
        // Find the user with the given email
        const user = authData?.users?.find(u => u.email === email);
        
        if (!user) {
          throw new Error(`User with email ${email} not found`);
        }
        
        console.log('Found user:', user);
        
        // 1. Assign admin role
        const adminRoleAssigned = await assignAdminRole(user.id);
        if (!adminRoleAssigned) {
          throw new Error('Failed to assign admin role');
        }
        
        // 2. Update plan to premium unlimited
        const planUpdated = await updateUserPlan(user.id, 'premium');
        if (!planUpdated) {
          throw new Error('Failed to update user plan');
        }
        
        // 3. Set unlimited remaining generations
        const generationsUpdated = await updateUserRemainingGenerations(user.id, 9999);
        if (!generationsUpdated) {
          throw new Error('Failed to update remaining generations');
        }
      } else {
        // User found in profiles, use the id
        const userId = users.id;
        
        // 1. Assign admin role
        const adminRoleAssigned = await assignAdminRole(userId);
        if (!adminRoleAssigned) {
          throw new Error('Failed to assign admin role');
        }
        
        // 2. Update plan to premium unlimited
        const planUpdated = await updateUserPlan(userId, 'premium');
        if (!planUpdated) {
          throw new Error('Failed to update user plan');
        }
        
        // 3. Set unlimited remaining generations
        const generationsUpdated = await updateUserRemainingGenerations(userId, 9999);
        if (!generationsUpdated) {
          throw new Error('Failed to update remaining generations');
        }
      }
      
      // Success
      setSuccess(true);
      toast({
        title: 'Success',
        description: `User ${email} has been updated with admin role and premium plan`,
      });
      
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Update User Permissions</CardTitle>
          <CardDescription>
            Assign admin role and premium plan to a user
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleAssignPermissions}
            disabled={loading || !email || success}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                User Updated Successfully
              </>
            ) : (
              'Update User Permissions'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminUserUpdate;
