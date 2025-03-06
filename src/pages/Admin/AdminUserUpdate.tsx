
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdminUserUpdate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    id: '',
    email: '',
    role: '',
    credits: 0,
    subscription_tier: 'free'
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          toast({
            title: "Error",
            description: "No user ID provided",
            variant: "destructive"
          });
          navigate('/admin/users');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUser({
            id: data.id,
            email: data.email || '',
            role: data.role || 'user',
            credits: data.credits || 0,
            subscription_tier: data.subscription_tier || 'free'
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: user.role,
          credits: user.credits,
          subscription_tier: user.subscription_tier
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      // Navigate back to users list
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Update User</h1>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          Back to Users
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit User Information</CardTitle>
          <CardDescription>Update user details and permissions</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                value={user.email}
                disabled
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                name="role" 
                value={user.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input 
                id="credits"
                name="credits"
                type="number"
                value={user.credits}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscription_tier">Subscription Tier</Label>
              <Select
                name="subscription_tier" 
                value={user.subscription_tier}
                onValueChange={(value) => handleSelectChange('subscription_tier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminUserUpdate;
