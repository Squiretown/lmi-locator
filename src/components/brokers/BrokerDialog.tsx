
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BrokerForm, { BrokerFormValues } from './BrokerForm';

interface BrokerDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: BrokerFormValues) => Promise<void>;
  defaultValues?: Partial<BrokerFormValues>;
  isLoading?: boolean;
  title: string;
}

const BrokerDialog: React.FC<BrokerDialogProps> = ({
  isOpen,
  setIsOpen,
  onSubmit,
  defaultValues,
  isLoading,
  title,
}) => {
  const handleFormSubmit = async (data: BrokerFormValues) => {
    await onSubmit(data);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <BrokerForm
          defaultValues={defaultValues}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BrokerDialog;
