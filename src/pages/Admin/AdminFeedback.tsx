
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabaseTyped } from '@/utils/supabaseHelper';
import FeedbackFilters from '@/components/admin/feedback/FeedbackFilters';
import FeedbackTable from '@/components/admin/feedback/FeedbackTable';
import FeedbackPagination from '@/components/admin/feedback/FeedbackPagination';
import FeedbackDetailsDialog from '@/components/admin/feedback/FeedbackDetailsDialog';
import FeedbackLoading from '@/components/admin/feedback/FeedbackLoading';

// Define the FeedbackItem interface once to avoid type conflicts
interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  email?: string;
  created_at: string;
  status: string;
  admin_notes?: string;
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
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
      
      setFeedback(paginatedData as FeedbackItem[]);
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

  const handleStatusChange = async (id: string, status: string) => {
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

  const openFeedbackDetails = (item: FeedbackItem) => {
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
  const types = [...new Set(feedback.map(item => item.type).filter(Boolean))];
  const statuses = [...new Set(feedback.map(item => item.status).filter(Boolean))];
  
  // Get status badge variant - fixed to use only allowed variants
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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
      <FeedbackFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onRefresh={loadFeedback}
        types={types}
        statuses={statuses}
      />

      {/* Feedback Table */}
      {loading ? (
        <FeedbackLoading />
      ) : (
        <>
          <FeedbackTable 
            feedback={filteredFeedback}
            onOpenDetails={openFeedbackDetails}
            onStatusChange={handleStatusChange}
            getStatusBadgeVariant={getStatusBadgeVariant}
          />
          
          {/* Pagination */}
          <FeedbackPagination
            page={page}
            setPage={setPage}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}

      {/* Feedback Details Dialog */}
      <FeedbackDetailsDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedFeedback={selectedFeedback}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onStatusChange={handleStatusChange}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
};

export default AdminFeedback;
