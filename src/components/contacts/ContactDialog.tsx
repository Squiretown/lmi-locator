
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ContactForm from './ContactForm';
import { ContactFormValues, Contact } from '@/lib/api/types';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormValues) => Promise<void>;
  isEditMode: boolean;
  initialValues?: Partial<Contact> | null;
  title?: string;
}

const ContactDialog: React.FC<ContactDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  initialValues,
  title,
}) => {
  const handleFormSubmit = async (data: ContactFormValues) => {
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
          <DialogTitle>
            {title || (isEditMode ? 'Edit Contact' : 'Add New Contact')}
          </DialogTitle>
        </DialogHeader>
        <ContactForm
          defaultValues={initialValues}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
