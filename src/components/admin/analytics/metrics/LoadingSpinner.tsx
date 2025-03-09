
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingSpinner;
