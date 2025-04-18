
import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AddressSectionProps {
  address: string;
  tractId: string;
  isApproved: boolean;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  tractId,
  isApproved
}) => {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <MapPin className="h-8 w-8 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <p className="text-lg font-medium">{address}</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            Census Tract: {tractId}
          </Badge>
          <Badge 
            variant={isApproved ? 'success' : 'destructive'}
            className="text-xs"
          >
            {isApproved ? 'Low Income Area' : 'Upper Income Area'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
