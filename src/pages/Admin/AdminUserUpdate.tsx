import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { assignAdminRole, updateUserPlan, updateUserRemainingGenerations } from '@/utils/supabase/userRoles';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  email?: string;
}

const AdminUserUpdate = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    setEmail('a.mackeliunas@gmail.com');
  }, []);
  
  const handleAssignPermissions = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Error fetching user: ${profileError.message}`);
      }
      
      let userId;
      
      if (!profileData) {
        try {
          const { data: authUserData, error: authError } = await supabase.auth.admin.getUserByEmail(email);
          
          if (authError || !authUserData?.user) {
            throw new Error(`User with email ${email} not found or could not be retrieved`);
          }
          
          userId = authUserData.user.id;
          console.log('Found user by email:', userId);
        } catch (err) {
          console.error('Error finding user by email:', err);
          throw new Error(`User with email ${email} not found or could not be processed`);
        }
      } else {
        userId = profileData.id;
      }
      
      if (!userId) {
        throw new Error(`Could not determine user ID for ${email}`);
      }
      
      const adminRoleAssigned = await assignAdminRole(userId);
      if (!adminRoleAssigned) {
        throw new Error('Failed to assign admin role');
      }
      
      const planUpdated = await updateUserPlan(userId, 'premium');
      if (!planUpdated) {
        throw new Error('Failed to update user plan');
      }
      
      const generationsUpdated = await updateUserRemainingGenerations(userId, 9999);
      if (!generationsUpdated) {
        throw new Error('Failed to update remaining generations');
      }
      
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
