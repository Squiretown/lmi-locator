import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataSourceInfo } from '@/components/lmi/DataSourceInfo';

interface AddressSectionProps {
  address: string;
  tractId: string;
  isApproved: boolean;
  dataSource?: any;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  tractId,
  isApproved,
  dataSource
}) => {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden p-2 border border-gray-200">
        <img 
          src="https://llhofjbijjxkfezidxyi.supabase.co/storage/v1/object/public/branding/lmi-logo.svg" 
          alt="LMI Logo" 
          className="w-full h-full object-contain"
        />
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
        
        {/* Data Source Information */}
        {dataSource && (
          <div className="mt-4">
            <DataSourceInfo result={dataSource} compact={true} />
          </div>
        )}
      </div>
    </div>
  );
};