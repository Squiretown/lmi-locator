
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RealtorForm, RealtorFormValues } from './RealtorForm';

interface RealtorDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: RealtorFormValues) => Promise<void>;
  defaultValues?: Partial<RealtorFormValues>;
  isLoading: boolean;
  title: string;
}

const RealtorDialog: React.FC<RealtorDialogProps> = ({
  isOpen,
  setIsOpen,
  onSubmit,
  defaultValues,
  isLoading,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <RealtorForm 
          defaultValues={defaultValues} 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default RealtorDialog;
