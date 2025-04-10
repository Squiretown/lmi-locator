
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BrokerForm from './BrokerForm';
import { BrokerFormValues } from '@/lib/api/types';
import { MortgageBroker } from '@/lib/api/types';

interface BrokerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BrokerFormValues) => Promise<void>;
  isEditMode: boolean;
  initialValues?: Partial<MortgageBroker> | null;
}

const BrokerDialog: React.FC<BrokerDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  initialValues,
}) => {
  const handleFormSubmit = async (data: BrokerFormValues) => {
    await onSave(data);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Broker' : 'Add New Broker'}</DialogTitle>
        </DialogHeader>
        <BrokerForm
          defaultValues={initialValues}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BrokerDialog;
