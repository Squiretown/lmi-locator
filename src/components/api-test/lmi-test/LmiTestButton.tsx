
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
    <Button 
      onClick={onClick} 
      disabled={loading || disabled}
    >
      {loading ? 'Processing...' : 'Test LMI Status'}
    </Button>
  );
};

export default LmiTestButton;
