import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { ClientProfile } from '@/lib/types/user-models';
import { formatDistanceToNow } from 'date-fns';
import { ClientActionsDropdown } from './ClientActionsDropdown';

interface ClientTableProps {
  clients: ClientProfile[];
  onEdit: (client: ClientProfile) => void;
  onDelete: (clientId: string) => void;
  onView: (client: ClientProfile) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  isLoading = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'deactivated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Deactivated</Badge>;
      case 'lead':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Lead</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading clients...</div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">No clients found. Create your first client!</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Income</TableHead>
            <TableHead>First Time Buyer</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.first_name} {client.last_name}
              </TableCell>
              <TableCell>{client.email || 'N/A'}</TableCell>
              <TableCell>{client.phone || 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell>
                {client.income ? `$${client.income.toLocaleString()}` : 'N/A'}
              </TableCell>
              <TableCell>
                {client.first_time_buyer === null ? 'Unknown' : client.first_time_buyer ? 'Yes' : 'No'}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <ClientActionsDropdown
                  client={client}
                  onEdit={onEdit}
                  onView={onView}
                  onStatusChange={onRefresh}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};