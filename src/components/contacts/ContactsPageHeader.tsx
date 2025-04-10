
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContactsPageHeaderProps {
  onAddNewContact: () => void;
}

const ContactsPageHeader: React.FC<ContactsPageHeaderProps> = ({ onAddNewContact }) => {
  return (
    <>
      <div className="mb-6">
        <Link to="/admin/professionals" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Professionals
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contacts</h2>
          <p className="text-muted-foreground">Manage contacts for this professional</p>
        </div>
        <Button onClick={onAddNewContact}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Contact
        </Button>
      </div>
    </>
  );
};

export default ContactsPageHeader;
