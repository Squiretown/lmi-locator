import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const InviteContact: React.FC = () => {
  const handleCreate = () => {
    console.log('Creating invitation');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Contact</CardTitle>
        <p className="text-sm text-muted-foreground">Send clients a link to check LMI property eligibility</p>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreate} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </CardContent>
    </Card>
  );
};