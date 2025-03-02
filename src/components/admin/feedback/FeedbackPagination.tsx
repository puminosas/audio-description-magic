
import React from 'react';
import { Button } from "@/components/ui/button";

interface FeedbackPaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
}

const FeedbackPagination = ({
  page,
  setPage,
  totalCount,
  itemsPerPage
}: FeedbackPaginationProps) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((page - 1) * itemsPerPage + 1, totalCount)} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} entries
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={page * itemsPerPage >= totalCount}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default FeedbackPagination;
