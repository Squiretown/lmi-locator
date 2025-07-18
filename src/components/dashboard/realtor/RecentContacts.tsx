import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { formatDistanceToNow } from 'date-fns';

export const RecentContacts: React.FC = () => {
  const { clients } = useRealtorClientManagement();
  const [selectedClient, setSelectedClient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const recentContacts = clients.slice(0, 3);

  const handleContactClick = (contact) => {
    setSelectedClient(contact);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent contacts</p>
        ) : (
          recentContacts.map((contact) => (
            <div 
              key={contact.id} 
              className="space-y-2 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => handleContactClick(contact)}
            >
              <div className="font-medium text-sm">
                {contact.first_name} {contact.last_name}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                  {contact.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(contact.created_at || ''), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <ClientDetailsDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
      />
    </Card>
  );
};