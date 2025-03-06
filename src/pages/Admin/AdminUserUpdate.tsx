import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  // Add other user properties as needed
}

const AdminUserUpdate = () => {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    // Extract user ID from query parameters
    const { id } = router.query;
    if (typeof id === 'string') {
      setUserId(id);
    }
  }, [router.query]);

  useEffect(() => {
    // Fetch user data when userId is available
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, supabase]);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // If you have the user's ID:
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      // Or if you need to search by email, use a different approach:
      // const { data: userData, error: userError } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('email', email)
      //   .single();
      
      if (userError) throw userError;
      setUser(userData?.user || null);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // Implement your user update logic here
      // Example:
      // const { data, error } = await supabase
      //   .from('users')
      //   .update({ /* updated fields */ })
      //   .eq('id', userId);

      // if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully!",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Update User</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Modify user details and save changes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              View and modify user information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-destructive/15 rounded-lg space-y-2 text-destructive">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading user data...
              </div>
            ) : user ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={user.id}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                  />
                </div>
                {/* Add more input fields for other user properties */}
              </>
            ) : (
              <p className="text-muted-foreground">No user data available.</p>
            )}
          </CardContent>
          {user && (
            <div className="p-6">
              <Button 
                onClick={handleUpdateUser} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminUserUpdate;
