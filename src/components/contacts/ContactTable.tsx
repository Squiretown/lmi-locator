
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import { Contact } from '@/lib/api/types';

interface ContactTableProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onViewInteractions?: (contact: Contact) => void;
}

const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onEdit,
  onDelete,
  onViewInteractions
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No contacts found.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  {contact.firstName} {contact.lastName}
                </TableCell>
                <TableCell>{contact.email || '—'}</TableCell>
                <TableCell>{contact.phone || '—'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(contact.status)}`}>
                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewInteractions && (
                      <Button variant="ghost" size="icon" onClick={() => onViewInteractions(contact)}>
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">View Interactions</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(contact)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactTable;
