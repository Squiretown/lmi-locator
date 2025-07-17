import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Users } from 'lucide-react';
import { useClientManagement } from '@/hooks/useClientManagement';
import { ClientTable } from '@/components/clients/ClientTable';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { InvitationManagement } from '@/components/clients/InvitationManagement';
import { TeamManagement } from '@/components/teams/TeamManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const MortgageClients: React.FC = () => {
  const {
    clients,
    isLoadingClients,
    selectedClient,
    setSelectedClient,
    createClient,
    deleteClient,
    isCreating,
    isDeleting,
  } = useClientManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchQuery)
    );
  });

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setShowCreateDialog(true); // Reuse create dialog for editing
  };

  const handleDelete = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(clientId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleView = (client: any) => {
    setSelectedClient(client);
    setShowDetailsDialog(true);
  };

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'lead').length,
    firstTimeBuyers: clients.filter(c => c.first_time_buyer === true).length,
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Client Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your mortgage clients, track their information, and send invitations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First-Time Buyers</CardTitle>
            <div className="h-2 w-2 bg-purple-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.firstTimeBuyers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Client Management, Invitations, and Team */}
      <Tabs defaultValue="clients" className="w-full">
        <TabsList>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          {/* Actions Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>

          {/* Client Table */}
          <Card>
            <CardHeader>
              <CardTitle>Clients ({filteredClients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientTable
                clients={filteredClients}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onRefresh={() => window.location.reload()}
                isLoading={isLoadingClients}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationManagement />
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateClientDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={createClient}
        isLoading={isCreating}
      />

      <ClientDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        client={selectedClient}
      />
    </div>
  );
};

export default MortgageClients;