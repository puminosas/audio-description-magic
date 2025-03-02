
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

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
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  
  // Calculate displayed items range
  const startItem = Math.min((page - 1) * itemsPerPage + 1, totalCount);
  const endItem = Math.min(page * itemsPerPage, totalCount);
  
  // Generate page numbers to display (show up to 5 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Logic to determine which page numbers to show
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-sm text-muted-foreground order-2 md:order-1">
        {totalCount > 0 ? (
          <>Showing {startItem} to {endItem} of {totalCount} entries</>
        ) : (
          <>No entries found</>
        )}
      </div>
      
      <Pagination className="order-1 md:order-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {getPageNumbers().map(pageNumber => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                onClick={() => setPage(pageNumber)}
                isActive={pageNumber === page}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default AudioFilesPagination;
