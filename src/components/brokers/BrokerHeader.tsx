
import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface BrokerHeaderProps {
  onAddBroker: () => void;
}

const BrokerHeader: React.FC<BrokerHeaderProps> = ({ onAddBroker }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6" />
          <CardTitle>Mortgage Brokers Management</CardTitle>
        </div>
        <Button onClick={onAddBroker} className="flex items-center space-x-1">
          <Plus className="h-4 w-4" />
          <span>Add Broker</span>
        </Button>
      </div>
    </CardHeader>
  );
};

export default BrokerHeader;
