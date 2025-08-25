import React from 'react';

function CommonLoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export default CommonLoadingSpinner;