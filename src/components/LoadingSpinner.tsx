
import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  className = "" 
}) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <LoaderCircle 
        className="animate-spin text-primary" 
        size={size} 
      />
    </div>
  );
};

export default LoadingSpinner;
