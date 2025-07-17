import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientManagement';
import { formatDistanceToNow } from 'date-fns';

interface ClientTableProps {
  clients: ClientProfile[];
  onEdit: (client: ClientProfile) => void;
  onDelete: (clientId: string) => void;
  onView: (client: ClientProfile) => void;
  isLoading?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
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
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(client.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};