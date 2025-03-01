import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const loadFeedback = async () => {
    try {
      setLoading(true);
      
      // Get feedback data
      const { data: feedbackData, error: dataError } = await supabaseTyped.feedback.select();
      
      if (dataError) throw dataError;
      
      setTotalCount(feedbackData?.length || 0);
      
      // Apply manual pagination
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const sortedData = feedbackData ? 
        [...feedbackData].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) : [];
      const paginatedData = sortedData.slice(start, end);
      
      setFeedback(paginatedData);
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
  }, [page]);

  const handleStatusChange = async (id, status) => {
    try {
      const { error } = await supabaseTyped.feedback
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      setFeedback(feedback.map(item => 
        item.id === id ? { ...item, status } : item
      ));
      
      toast({
        title: 'Success',
        description: `Feedback status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feedback status.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedFeedback) return;
    
    try {
      const { error } = await supabaseTyped.feedback
        .update({ 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedFeedback.id);
      
      if (error) throw error;
      
      setFeedback(feedback.map(item => 
        item.id === selectedFeedback.id ? { ...item, admin_notes: adminNotes } : item
      ));
      
      setDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Admin notes saved successfully.',
      });
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save admin notes.',
        variant: 'destructive',
      });
    }
  };

  const openFeedbackDetails = (item) => {
    setSelectedFeedback(item);
    setAdminNotes(item.admin_notes || '');
    setDialogOpen(true);
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || item.type === filterType;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get unique types and statuses for filters
  const types = [...new Set(feedback.map(item => item.type))];
  const statuses = [...new Set(feedback.map(item => item.status))];
  
  // Get status badge variant - fixed to use only allowed variants
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'new':
        return 'outline';
      case 'resolved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by message or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-[200px]">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-[200px]">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={loadFeedback}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Feedback Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={item.type === 'bug' ? 'destructive' : 'default'}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {item.message}
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openFeedbackDetails(item)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          
                          {item.status !== 'resolved' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleStatusChange(item.id, 'resolved')}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          
                          {item.status !== 'new' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleStatusChange(item.id, 'new')}
                            >
                              <XCircle className="h-4 w-4 text-orange-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * itemsPerPage + 1, totalCount)} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} entries
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page * itemsPerPage >= totalCount}
                onClick={() => setPage(page => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Feedback Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-1">Type</h4>
                <Badge variant={selectedFeedback.type === 'bug' ? 'destructive' : 'default'}>
                  {selectedFeedback.type}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">From</h4>
                <p>{selectedFeedback.email || 'Anonymous'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Message</h4>
                <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Status</h4>
                <Select 
                  value={selectedFeedback.status} 
                  onValueChange={(value) => handleStatusChange(selectedFeedback.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this feedback..."
                  rows={5}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;
