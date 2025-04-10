
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, isLoading }) => {
  return (
    <div className="flex items-center justify-end space-x-4 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Contact'}
      </Button>
    </div>
  );
};

export default FormActions;
