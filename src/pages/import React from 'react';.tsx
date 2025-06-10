import React from 'react';

interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "w-8 h-8", 
  color = "text-blue-600" 
}) => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`animate-spin rounded-full border-4 border-t-transparent ${size} ${color}`}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;