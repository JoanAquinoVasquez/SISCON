import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total?: number;
  from?: number;
  to?: number;
  onPageChange: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  perPage,
  onPerPageChange,
}: PaginationProps) {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Keep page input in sync with currentPage changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= lastPage) {
      onPageChange(pageNum);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= lastPage) {
      onPageChange(pageNum);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Helper to generate the list of pages to show
  const getPageNumbers = () => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount + firstPage + lastPage + currentPage + 2*ellipses

    if (totalPageNumbers >= lastPage) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', lastPage];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => lastPage - rightItemCount + i + 1
      );
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', lastPage];
    }

    return [];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-100 bg-white">
      {/* Informative text */}
      <div className="text-sm text-slate-500 font-medium">
        {total !== undefined && from !== undefined && to !== undefined ? (
          <span>
            Mostrando <span className="font-semibold text-slate-800">{from}</span> a{' '}
            <span className="font-semibold text-slate-800">{to}</span> de{' '}
            <span className="font-semibold text-slate-800">{total}</span> registros
          </span>
        ) : (
          <span>
            Página <span className="font-semibold text-slate-800">{currentPage}</span> de{' '}
            <span className="font-semibold text-slate-800">{lastPage}</span>
          </span>
        )}
      </div>

      {/* Main navigation controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-slate-400 font-medium select-none">
                ...
              </span>
            );
          }
          return (
            <Button
              key={`page-${p}`}
              variant={currentPage === p ? 'default' : 'outline'}
              size="sm"
              className={`h-8 w-8 font-medium transition-all ${
                currentPage === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          );
        })}

        {/* Next page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage === lastPage}
          title="Siguiente página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          onClick={() => onPageChange(lastPage)}
          disabled={currentPage === lastPage}
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Auxiliary controls: Jump to page & Items per page */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {/* Go to page input */}
        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">Ir a:</span>
          <input
            type="text"
            pattern="[0-9]*"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
            onBlur={handlePageInputBlur}
            className="w-12 h-8 text-center text-xs font-semibold rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-800"
          />
        </form>

        {/* Rows per page selector */}
        {perPage !== undefined && onPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Filas:</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(parseInt(e.target.value, 10))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
