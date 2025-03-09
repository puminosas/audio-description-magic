
import React from 'react';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import FeedbackFilters from '@/components/admin/feedback/FeedbackFilters';
import FeedbackTable from '@/components/admin/feedback/FeedbackTable';
import FeedbackPagination from '@/components/admin/feedback/FeedbackPagination';
import FeedbackDetailsDialog from '@/components/admin/feedback/FeedbackDetailsDialog';
import FeedbackLoading from '@/components/admin/feedback/FeedbackLoading';

const AdminFeedback = () => {
  const {
    feedback,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    page,
    setPage,
    totalCount,
    itemsPerPage,
    selectedFeedback,
    adminNotes,
    setAdminNotes,
    dialogOpen,
    setDialogOpen,
    loadFeedback,
    handleStatusChange,
    handleSaveNotes,
    openFeedbackDetails,
    types,
    statuses,
    getStatusBadgeVariant
  } = useAdminFeedback();

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
            feedback={feedback}
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
