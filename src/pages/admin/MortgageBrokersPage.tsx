
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock data for initial development
const mockBrokers = [
  {
    id: '1',
    name: 'John Smith',
    company: 'First Choice Mortgage',
    license_number: 'ML123456',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'active',
    created_at: '2023-05-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'Premier Lending Group',
    license_number: 'ML789012',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    status: 'pending',
    created_at: '2023-06-02T14:45:00Z'
  },
  {
    id: '3',
    name: 'Michael Brown',
    company: 'Reliable Mortgage Solutions',
    license_number: 'ML345678',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    status: 'inactive',
    created_at: '2023-04-20T09:15:00Z'
  }
];

// Interface for broker data
interface MortgageBroker {
  id: string;
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

const MortgageBrokersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // In a real implementation, this would fetch from Supabase
  const { data: brokers, isLoading, error } = useQuery({
    queryKey: ['mortgageBrokers'],
    queryFn: async () => {
      // This is where you would fetch real data from Supabase
      // const { data, error } = await supabase
      //   .from('mortgage_brokers')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      
      // if (error) throw error;
      // return data;
      
      // For now, return mock data
      return mockBrokers;
    }
  });

  const handleAddBroker = () => {
    toast.info("Add broker functionality coming soon");
  };

  const handleEditBroker = (id: string) => {
    toast.info(`Edit broker with ID: ${id} - Coming soon`);
  };

  const handleDeleteBroker = (id: string) => {
    toast.info(`Delete broker with ID: ${id} - Coming soon`);
  };

  const handleViewPermissions = (id: string) => {
    toast.info(`View permissions for broker with ID: ${id} - Coming soon`);
  };

  const filteredBrokers = brokers?.filter(broker => 
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <CardTitle>Mortgage Brokers Management</CardTitle>
            </div>
            <Button onClick={handleAddBroker} className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Broker</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brokers..."
                className="pl-8 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading brokers...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading brokers: {error.toString()}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrokers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No brokers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBrokers?.map(broker => (
                      <TableRow key={broker.id}>
                        <TableCell className="font-medium">{broker.name}</TableCell>
                        <TableCell>{broker.company}</TableCell>
                        <TableCell>{broker.license_number}</TableCell>
                        <TableCell>
                          <div>{broker.email}</div>
                          <div className="text-xs text-muted-foreground">{broker.phone}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            broker.status === 'active' ? 'bg-green-100 text-green-800' :
                            broker.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditBroker(broker.id)}
                              title="Edit broker"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteBroker(broker.id)}
                              title="Delete broker"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleViewPermissions(broker.id)}
                              title="Manage permissions"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MortgageBrokersPage;
