
import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Shield, Link } from 'lucide-react';
import { Realtor } from '@/lib/api/realtors';

interface RealtorTableProps {
  realtors: Realtor[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onEdit: (realtor: Realtor) => void;
  onDelete: (realtor: Realtor) => void;
  onManagePermissions: (realtor: Realtor) => void;
}

const RealtorTable: React.FC<RealtorTableProps> = ({
  realtors, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onManagePermissions 
}) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading realtors...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading realtors: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!realtors || realtors.length === 0) {
    return (
      <div className="text-center py-4">
        No realtors found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Brokerage</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {realtors.map(realtor => (
            <TableRow key={realtor.id}>
              <TableCell className="font-medium">{realtor.name}</TableCell>
              <TableCell>{realtor.brokerage}</TableCell>
              <TableCell>{realtor.license_number || 'N/A'}</TableCell>
              <TableCell>
                <div>{realtor.email || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{realtor.phone || 'No phone'}</div>
              </TableCell>
              <TableCell>
                {realtor.is_flagged ? (
                  <Badge variant="destructive">Flagged</Badge>
                ) : (
                  <Badge variant="outline">Active</Badge>
                )}
                {realtor.website && (
                  <div className="mt-1">
                    <a 
                      href={realtor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 flex items-center"
                    >
                      <Link className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(realtor)}
                    title="Edit realtor"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(realtor)}
                    title="Delete realtor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onManagePermissions(realtor)}
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

export default RealtorTable;
