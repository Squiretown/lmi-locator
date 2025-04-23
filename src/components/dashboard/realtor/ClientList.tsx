
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListFilter, Plus } from 'lucide-react';
import { ClientRow } from './ClientRow';
import { ClientRowData } from './types';

const clientData: ClientRowData[] = [
  { name: 'Sarah Johnson', status: 'Active', interest: 'Single Family', eligible: true, contact: '2 days ago' },
  { name: 'Michael Brown', status: 'New Lead', interest: 'Condo', eligible: true, contact: 'Today' },
  { name: 'Emily Davis', status: 'Active', interest: 'Townhouse', eligible: false, contact: '1 week ago' },
  { name: 'Robert Wilson', status: 'Closing', interest: 'Single Family', eligible: true, contact: 'Yesterday' },
  { name: 'Lisa Martinez', status: 'Searching', interest: 'Multi-Family', eligible: true, contact: '3 days ago' },
];

export const ClientList = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4 px-6 pt-6">
        <h2 className="text-xl font-semibold">Client List</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <ListFilter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Client
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Property Interest</th>
                <th className="p-3 text-left font-medium">LMI Eligible</th>
                <th className="p-3 text-left font-medium">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {clientData.map((client, i) => (
                <ClientRow key={i} {...client} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
