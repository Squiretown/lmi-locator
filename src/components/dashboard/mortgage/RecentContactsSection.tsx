
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvitedContacts } from '@/hooks/useInvitedContacts';
import { formatDistanceToNow } from 'date-fns';

export const RecentContactsSection: React.FC = () => {
  const { contacts, isLoading } = useInvitedContacts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  name={(contact.client_name || contact.client_email) as string}
                  type="Invited"
                  status={(contact.status === 'accepted' ? 'accepted' : 'invited') as 'invited' | 'accepted' | 'registered'}
                  date={formatDistanceToNow(new Date((contact.sent_at || contact.created_at) as string), { addSuffix: true })}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No contacts invited yet. Send your first invitation!
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface ContactItemProps {
  name: string;
  type: string;
  status: 'invited' | 'accepted' | 'registered';
  date: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ name, type, status, date }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Invited</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Accepted</Badge>;
      case 'registered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Registered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <p className="font-medium">{name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
          {getStatusBadge(status)}
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{date}</span>
    </div>
  );
};
