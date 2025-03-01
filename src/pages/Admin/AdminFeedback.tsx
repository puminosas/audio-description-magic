
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'dismissed';

interface Feedback {
  id: string;
  user_id: string | null;
  email: string | null;
  type: 'suggestion' | 'bug' | 'other';
  message: string;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const AdminFeedback = () => {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, [page]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      // Fetch feedback for current page
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedbackItems(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setNewStatus(feedback.status);
    setAdminNotes(feedback.admin_notes || '');
    setDetailDialogOpen(true);
  };

  const updateFeedbackStatus = async () => {
    if (!selectedFeedback) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback updated successfully.',
      });

      // Refresh feedback list
      fetchFeedback();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feedback.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="text-muted-foreground">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'bug':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feedback Management</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackItems.map(item => (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <span className="ml-2 capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{item.message}</div>
                    </TableCell>
                    <TableCell>
                      {item.email || 'Anonymous'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {feedbackItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No feedback items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, totalItems)} of {totalItems} items
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Feedback Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View and manage feedback from users
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 py-2">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {getTypeIcon(selectedFeedback.type)}
                    <span className="ml-2 font-medium capitalize">{selectedFeedback.type}</span>
                  </div>
                  {getStatusBadge(selectedFeedback.status)}
                </div>
                <p className="text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                  From: {selectedFeedback.email || 'Anonymous'} • 
                  {formatDate(selectedFeedback.created_at)}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as FeedbackStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add internal notes about this feedback..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateFeedbackStatus}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;
