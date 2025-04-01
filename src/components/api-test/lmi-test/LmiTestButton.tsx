
import React from 'react';
import { Button } from '@/components/ui/button';

interface LmiTestButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

const LmiTestButton: React.FC<LmiTestButtonProps> = ({
  onClick,
  loading,
  disabled
}) => {
  return (
    <div className="flex justify-end mt-4">
      <Button 
        onClick={onClick} 
        disabled={loading || disabled}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <span className="flex items-center">
            <span className="mr-2">Processing</span>
            <span className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </span>
        ) : 'Test LMI Status'}
      </Button>
    </div>
  );
};

export default LmiTestButton;
