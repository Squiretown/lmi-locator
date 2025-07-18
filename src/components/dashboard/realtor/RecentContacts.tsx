import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';

export const RecentContacts: React.FC = () => {
  const { clients } = useRealtorClientManagement();

  const recentContacts = clients.slice(0, 3);

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
            <div key={contact.id} className="space-y-2">
              <div className="font-medium text-sm">
                {contact.first_name} {contact.last_name}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                  {contact.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(contact.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};