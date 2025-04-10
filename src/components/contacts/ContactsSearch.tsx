
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ContactsSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const ContactsSearch: React.FC<ContactsSearchProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default ContactsSearch;
