
import React from 'react';
import { Button } from "@/components/ui/button";

interface AudioFilesPaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
}

const AudioFilesPagination = ({
  page,
  setPage,
  totalCount,
  itemsPerPage
}: AudioFilesPaginationProps) => {
  const goToPreviousPage = () => {
    setPage(Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPage(page + 1);
  };

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
          onClick={goToPreviousPage}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={page * itemsPerPage >= totalCount}
          onClick={goToNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AudioFilesPagination;
