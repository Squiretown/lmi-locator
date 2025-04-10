
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface RealtorHeaderProps {
  onAddRealtor: () => void;
}

const RealtorHeader: React.FC<RealtorHeaderProps> = ({ onAddRealtor }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building className="h-6 w-6" />
          <CardTitle>Realtors Management</CardTitle>
        </div>
        <Button onClick={onAddRealtor} className="flex items-center space-x-1">
          <Plus className="h-4 w-4" />
          <span>Add Realtor</span>
        </Button>
      </div>
    </CardHeader>
  );
};

export default RealtorHeader;
