
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ContactFormValues } from '@/lib/api/types';
import { contactFormSchema } from './form/ContactFormSchema';
import PersonalInfoFields from './form/PersonalInfoFields';
import ContactInfoFields from './form/ContactInfoFields';
import AddressField from './form/AddressField';
import StatusField from './form/StatusField';
import NotesField from './form/NotesField';
import FormActions from './form/FormActions';

interface ContactFormProps {
  defaultValues?: Partial<ContactFormValues>;
  onSubmit: (data: ContactFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      status: 'lead',
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: ContactFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // Error is handled in the mutation
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} />
        <ContactInfoFields form={form} />
        <AddressField form={form} />
        <StatusField form={form} />
        <NotesField form={form} />
        <FormActions onCancel={onCancel} isLoading={isLoading} />
      </form>
    </Form>
  );
};

export default ContactForm;
