
import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { MortgageBroker } from '@/lib/api/brokers';

interface BrokerTableProps {
  brokers: MortgageBroker[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onEdit: (broker: MortgageBroker) => void;
  onDelete: (broker: MortgageBroker) => void;
  onManagePermissions: (broker: MortgageBroker) => void;
}

const BrokerTable: React.FC<BrokerTableProps> = ({
  brokers, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onManagePermissions 
}) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading brokers...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading brokers: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!brokers || brokers.length === 0) {
    return (
      <div className="text-center py-4">
        No brokers found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brokers.map(broker => (
            <TableRow key={broker.id}>
              <TableCell className="font-medium">{broker.name}</TableCell>
              <TableCell>{broker.company}</TableCell>
              <TableCell>{broker.license_number}</TableCell>
              <TableCell>
                <div>{broker.email}</div>
                <div className="text-xs text-muted-foreground">{broker.phone}</div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  broker.status === 'active' ? 'bg-green-100 text-green-800' :
                  broker.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(broker)}
                    title="Edit broker"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(broker)}
                    title="Delete broker"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onManagePermissions(broker)}
                    title="Manage permissions"
                  >
                    <Shield className="h-4 w-4" />
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

export default BrokerTable;
