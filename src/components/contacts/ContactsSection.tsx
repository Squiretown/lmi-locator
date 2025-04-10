
import React from 'react';
import { Contact } from '@/lib/api/types';
import ContactTable from '@/components/contacts/ContactTable';

interface ContactsSectionProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      {isLoading ? (
        <div className="py-10 text-center">Loading contacts...</div>
      ) : (
        <ContactTable
          contacts={contacts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default ContactsSection;
