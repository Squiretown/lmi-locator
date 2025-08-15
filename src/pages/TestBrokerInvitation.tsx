import React, { useState } from 'react';
import { InviteBrokerDialog } from '@/components/brokers/InviteBrokerDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const TestBrokerInvitation: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Broker Invitation Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Click the button below to test the broker invitation functionality.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            Open Broker Invitation Dialog
          </Button>
          
          <InviteBrokerDialog 
            isOpen={isDialogOpen} 
            setIsOpen={setIsDialogOpen} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TestBrokerInvitation;