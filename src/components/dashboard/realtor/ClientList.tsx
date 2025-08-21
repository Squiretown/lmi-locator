
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListFilter, Plus, Search, Users, Mail } from 'lucide-react';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';
import { useUnifiedClientInvitations } from '@/hooks/useUnifiedClientInvitations';
import { ClientTable } from '@/components/clients/ClientTable';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { InvitationManagement } from '@/components/clients/InvitationManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ClientList = () => {
  const {
    clients,
    isLoadingClients,
    selectedClient,
    setSelectedClient,
    createClient,
    deleteClient,
    isCreating,
    isDeleting,
    refetch,
  } = useRealtorClientManagement();

  const { stats } = useUnifiedClientInvitations();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');

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

  const handleInvitedClientsClick = () => {
    setActiveTab('invitations');
  };

  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'lead').length,
    invitedClients: stats.total,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Total Clients</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold">{clientStats.total}</div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Active Clients</div>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold">{clientStats.active}</div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Leads</div>
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold">{clientStats.leads}</div>
          </div>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleInvitedClientsClick}
        >
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Invited Clients</div>
            <Mail className="h-4 w-4 text-amber-500" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-500">{clientStats.invitedClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to manage</p>
          </div>
        </Card>
      </div>

      {/* Tabs for Client Management and Invitations */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
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
            <div className="flex justify-between items-center p-6 pb-0">
              <h2 className="text-xl font-semibold">Clients ({filteredClients.length})</h2>
            </div>
            <CardContent>
              <ClientTable
                clients={filteredClients}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onRefresh={() => refetch()}
                isLoading={isLoadingClients}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationManagement />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateClientDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={createClient}
        isLoading={isCreating}
        userType="realtor"
      />

      <ClientDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        client={selectedClient}
      />
    </div>
  );
};
