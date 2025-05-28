
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { MortgageBroker } from '@/lib/api/types';

interface BrokersTableProps {
  brokers: MortgageBroker[];
  isLoading: boolean;
  error: Error | null;
  onEditBroker: (broker: MortgageBroker) => void;
  onDeleteBroker: (broker: MortgageBroker) => void;
}

export const BrokersTable: React.FC<BrokersTableProps> = ({
  brokers,
  isLoading,
  error,
  onEditBroker,
  onDeleteBroker,
}) => {
  if (isLoading) {
    return <div className="py-10 text-center">Loading brokers...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Error loading brokers: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brokers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No brokers found
              </TableCell>
            </TableRow>
          ) : (
            brokers.map((broker) => (
              <TableRow key={broker.id}>
                <TableCell className="font-medium">{broker.name}</TableCell>
                <TableCell>{broker.email}</TableCell>
                <TableCell>{broker.company}</TableCell>
                <TableCell>{broker.license_number}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    broker.status === 'active' ? 'bg-green-100 text-green-800' :
                    broker.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditBroker(broker)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeleteBroker(broker)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              Total: {brokers.length} brokers
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
