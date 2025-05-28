
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { Realtor } from '@/lib/api/realtors';

interface RealtorsTableProps {
  realtors: Realtor[];
  isLoading: boolean;
  error: Error | null;
  onEditRealtor: (realtor: Realtor) => void;
  onDeleteRealtor: (realtor: Realtor) => void;
}

export const RealtorsTable: React.FC<RealtorsTableProps> = ({
  realtors,
  isLoading,
  error,
  onEditRealtor,
  onDeleteRealtor,
}) => {
  if (isLoading) {
    return <div className="py-10 text-center">Loading realtors...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Error loading realtors: {error instanceof Error ? error.message : 'Unknown error'}
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
            <TableHead>Brokerage</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {realtors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No realtors found
              </TableCell>
            </TableRow>
          ) : (
            realtors.map((realtor) => (
              <TableRow key={realtor.id}>
                <TableCell className="font-medium">{realtor.name}</TableCell>
                <TableCell>{realtor.email}</TableCell>
                <TableCell>{realtor.brokerage}</TableCell>
                <TableCell>{realtor.license_number}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    realtor.status === 'active' ? 'bg-green-100 text-green-800' :
                    realtor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {realtor.status.charAt(0).toUpperCase() + realtor.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditRealtor(realtor)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeleteRealtor(realtor)}
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
              Total: {realtors.length} realtors
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
