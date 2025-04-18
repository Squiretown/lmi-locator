
import React from 'react';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SavedPropertiesTable: React.FC = () => {
  const { savedAddresses, removeAddress, isLoading } = useSavedAddresses();

  if (isLoading) {
    return <div className="text-center py-4">Loading saved properties...</div>;
  }

  if (!savedAddresses.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No saved properties yet</p>
        <p className="text-sm mt-2">Properties you check for LMI eligibility will appear here</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Saved</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {savedAddresses.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {property.address}
                </div>
              </TableCell>
              <TableCell>
                {property.isLmiEligible ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    LMI Eligible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Not Eligible
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAddress(property.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
