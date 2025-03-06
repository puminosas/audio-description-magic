
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminUserUpdate = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Create a type for user data that includes all expected fields
  interface UserData {
    id: string;
    email: string;
    plan: string;
    role?: string; // Optional fields that might not be in the original data
    credits?: number;
    subscription_tier?: string;
    created_at: string;
    updated_at: string;
    daily_limit: number;
    remaining_generations: number;
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Replace with your actual user data fetching logic
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        setUserData(data);
        // Initialize form values with defaults if needed
        setRole(data.role || 'user');
        setCredits(data.credits || 0);
        setPlan(data.subscription_tier || data.plan || 'free');
        
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updates = {
        plan: plan,
        role: role,
        credits: credits,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return <div>Loading user data...</div>;
  }
  
  if (!userData) {
    return <div>User not found</div>;
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Update User</CardTitle>
        <CardDescription>Modify user account details</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={userData.email} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
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
          
          <div className="space-y-2">
            <Label htmlFor="plan">Subscription Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="credits">Credits</Label>
            <Input 
              id="credits" 
              type="number" 
              value={credits}
              onChange={e => setCredits(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="createdAt">Created At</Label>
            <Input 
              id="createdAt" 
              value={new Date(userData.created_at).toLocaleString()} 
              disabled 
            />
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
          <Button type="submit">Update User</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminUserUpdate;
