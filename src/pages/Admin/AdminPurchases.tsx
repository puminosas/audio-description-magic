
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Search } from 'lucide-react';
import PurchasesTable, { Purchase } from '@/components/admin/PurchasesTable';
import { supabase } from '@/integrations/supabase/client';

const AdminPurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  
  // Load mock purchase data for now (will be replaced with real data once we have a payment system)
  const loadPurchases = async () => {
    try {
      setLoading(true);
      
      // For now, we're using mock data
      // In a real implementation, this would fetch from a 'purchases' table
      const mockPurchases: Purchase[] = [
        {
          id: '1',
          userId: '123456789',
          email: 'user1@example.com',
          plan: 'premium',
          amount: 19.99,
          status: 'completed',
          created_at: new Date().toISOString(),
          payment_method: 'credit card'
        },
        {
          id: '2',
          userId: '987654321',
          email: 'user2@example.com',
          plan: 'basic',
          amount: 9.99,
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
          payment_method: 'paypal'
        },
        {
          id: '3',
          userId: '456789123',
          email: 'user3@example.com',
          plan: 'premium',
          amount: 19.99,
          status: 'pending',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          payment_method: 'credit card'
        },
        {
          id: '4',
          userId: '789123456',
          email: 'user4@example.com',
          plan: 'basic',
          amount: 9.99,
          status: 'failed',
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          payment_method: 'credit card'
        }
      ];
      
      setPurchases(mockPurchases);
      
      // Get profile data to enrich the purchase records
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        // In a real implementation, we would join this data with purchases
        console.log('Profiles loaded:', profiles?.length || 0);
      }
      
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  // Filter purchases based on search term and filters
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      !searchTerm || 
      (purchase.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       purchase.userId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlan = filterPlan === 'all' || purchase.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-[150px]">
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-[150px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={loadPurchases}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Purchases table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <PurchasesTable purchases={filteredPurchases} />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPurchases;
