import React from 'react';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4 text-center" role="alert">
      <div className="bg-black/50 border border-red-500/50 rounded-xl shadow-lg p-8 max-w-lg w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong.</h2>
        <p className="text-gray-400 mb-6">
          We've encountered an unexpected error. Please try again.
        </p>
        
        {/* Display error details during development for easier debugging */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-amber-400">Error Details</summary>
            <pre className="mt-2 p-2 bg-gray-800 rounded-md text-xs text-red-300 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        <Button
          onClick={resetErrorBoundary}
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-6 rounded-lg"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default ErrorFallback;
