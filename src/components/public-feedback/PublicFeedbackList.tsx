
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  created_at: string;
  status: string;
}

const PublicFeedbackList = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const itemsPerPage = 5;
  
  const loadFeedback = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      
      // Only show resolved or in_progress feedback to the public
      const { data, error } = await supabase
        .from('feedback')
        .select('id, type, message, created_at, status')
        .in('status', ['resolved', 'in_progress'])
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * itemsPerPage, pageNum * itemsPerPage - 1);
      
      if (error) throw error;
      
      if (data) {
        // Set hasMore based on whether we got fewer items than requested
        setHasMore(data.length === itemsPerPage);
        
        // If appending (loading more), add to existing feedback, otherwise replace
        if (append) {
          setFeedback(prev => [...prev, ...data]);
        } else {
          setFeedback(data);
        }
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadFeedback();
  }, []);
  
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadFeedback(nextPage, true);
  };
  
  // Return a badge color based on feedback type
  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'bug':
        return 'destructive';
      case 'feature_request':
        return 'default';
      case 'suggestion':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
      
      {loading && feedback.length === 0 ? (
        // Loading skeletons
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full my-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))
      ) : feedback.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No public feedback available yet.</p>
          </CardContent>
        </Card>
      ) : (
        feedback.map((item) => (
          <Card key={item.id} className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={getTypeBadgeVariant(item.type)}>
                  {item.type.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <p className="mb-1 whitespace-pre-wrap">{item.message}</p>
              <div className="mt-3 flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {item.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      
      {!loading && hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
          >
            Load More
          </Button>
        </div>
      )}
      
      {!loading && feedback.length > 0 && !hasMore && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          You've reached the end of the feedback list.
        </p>
      )}
    </div>
  );
};

export default PublicFeedbackList;
