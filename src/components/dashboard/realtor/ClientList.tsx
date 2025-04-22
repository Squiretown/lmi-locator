
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListFilter, Plus } from 'lucide-react';

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

interface ClientRowProps {
  name: string;
  status: string;
  interest: string;
  eligible: boolean;
  contact: string;
}

const ClientRow: React.FC<ClientRowProps> = ({ name, status, interest, eligible, contact }) => (
  <tr className="border-t">
    <td className="p-3 font-medium">{name}</td>
    <td className="p-3">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === 'Active' ? 'bg-green-100 text-green-800' :
        status === 'New Lead' ? 'bg-blue-100 text-blue-800' :
        status === 'Closing' ? 'bg-purple-100 text-purple-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
    </td>
    <td className="p-3">{interest}</td>
    <td className="p-3">
      <span className={`inline-flex items-center rounded-full w-2 h-2 ${
        eligible ? 'bg-green-500' : 'bg-red-500'
      }`}></span>
      <span className="ml-1.5">{eligible ? 'Yes' : 'No'}</span>
    </td>
    <td className="p-3 text-muted-foreground">{contact}</td>
  </tr>
);

const clientData = [
  { name: 'Sarah Johnson', status: 'Active', interest: 'Single Family', eligible: true, contact: '2 days ago' },
  { name: 'Michael Brown', status: 'New Lead', interest: 'Condo', eligible: true, contact: 'Today' },
  { name: 'Emily Davis', status: 'Active', interest: 'Townhouse', eligible: false, contact: '1 week ago' },
  { name: 'Robert Wilson', status: 'Closing', interest: 'Single Family', eligible: true, contact: 'Yesterday' },
  { name: 'Lisa Martinez', status: 'Searching', interest: 'Multi-Family', eligible: true, contact: '3 days ago' },
];
