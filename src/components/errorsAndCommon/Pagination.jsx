import React, { useMemo } from 'react';
import { Button } from '../ui/button';
// Assuming you have a reusable Button component

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageClick = (page) => {
        if (page >= 0 && page < totalPages) {
            onPageChange(page);
        }
    };
    
    // Generates intelligent pagination buttons (e.g., 1, ..., 5, 6, 7, ..., 20)
    const pageButtons = useMemo(() => {
        const buttons = [];
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
          for (let i = 0; i < totalPages; i++) buttons.push(i);
          return buttons;
        }
        const first = 0;
        const last = totalPages - 1;
        const start = Math.max(first + 1, currentPage - 1);
        const end = Math.min(last - 1, currentPage + 1);
        const set = new Set([first]);
        if (start > 1) set.add('...');
        for (let i = start; i <= end; i++) set.add(i);
        if (end < last - 1) set.add('...');
        set.add(last);
        return Array.from(set);
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <Button onClick={() => handlePageClick(0)} disabled={currentPage === 0}>&laquo; First</Button>
            <Button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 0}>&lsaquo; Prev</Button>
            {pageButtons.map((p, idx) =>
                p === '...' ? (
                    <span key={`dots-${idx}`} className="px-4 py-2 text-gray-500">...</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => handlePageClick(p)}
                        className={`px-4 py-2 rounded-md border text-sm font-semibold ${p === currentPage ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/70 border-gray-700 hover:border-amber-500'}`}
                    >
                        {p + 1}
                    </button>
                )
            )}
            <Button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage >= totalPages - 1}>Next &rsaquo;</Button>
            <Button onClick={() => handlePageClick(totalPages - 1)} disabled={currentPage >= totalPages - 1}>Last &raquo;</Button>
        </div>
    );
};

export default Pagination;
