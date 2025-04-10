
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle 
} from 'lucide-react';
import type { MortgageBroker } from '@/lib/api/types';

interface BrokerTableProps {
  brokers: MortgageBroker[];
  onEdit: (broker: MortgageBroker) => void;
  onDelete: (id: string) => void;
  onOpenPermissions: (broker: MortgageBroker) => void;
}

const BrokerTable: React.FC<BrokerTableProps> = ({ 
  brokers, 
  onEdit, 
  onDelete,
  onOpenPermissions 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>License #</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brokers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No brokers found
              </TableCell>
            </TableRow>
          ) : (
            brokers.map((broker) => (
              <TableRow key={broker.id}>
                <TableCell>{broker.name}</TableCell>
                <TableCell>{broker.company}</TableCell>
                <TableCell>{broker.license_number}</TableCell>
                <TableCell>{broker.email}</TableCell>
                <TableCell>{broker.phone || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(broker.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(broker)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(broker.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenPermissions(broker)}
                    >
                      <Shield className="h-4 w-4" />
                      <span className="sr-only">Permissions</span>
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

export default BrokerTable;
