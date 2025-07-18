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
          recentContacts.map((contact, index) => (
            <div key={index} className="space-y-2">
              <div className="font-medium text-sm">
                {contact.first_name} {contact.last_name}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Invited</Badge>
                <Badge variant="secondary">Invited</Badge>
                <span className="text-xs text-muted-foreground">
                  about 2 months ago
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};