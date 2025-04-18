import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const RecentContactsSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {[
            { name: 'John Smith', type: 'Realtor', date: 'Today' },
            { name: 'John Smith', type: 'First Time Buyer', date: 'Today' },
            { name: 'John Smith', type: 'Realtor', date: 'Yesterday' },
            { name: 'John Smith', type: 'Buyer', date: 'Yesterday' },
            { name: 'John Smith', type: 'Realtor', date: 'Last Week' }
          ].map((contact, index) => (
            <ContactItem
              key={index}
              name={contact.name}
              type={contact.type}
              date={contact.date}
            />
          ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface ContactItemProps {
  name: string;
  type: string;
  date: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ name, type, date }) => (
  <div className="flex items-center justify-between border-b pb-4">
    <div>
      <p className="font-medium">{name}</p>
      <Badge variant="outline" className="mt-1">
        {type}
      </Badge>
    </div>
    <span className="text-sm text-muted-foreground">{date}</span>
  </div>
);
