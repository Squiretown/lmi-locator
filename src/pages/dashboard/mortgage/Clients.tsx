
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Mail, Phone, Calendar, ChevronDown, Search, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientManagement } from '@/hooks/useClientManagement';
import { useClientInvitations } from '@/hooks/useClientInvitations';
import { ClientTable } from '@/components/clients/ClientTable';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';
import { InvitationManagement } from '@/components/clients/InvitationManagement';

const MortgageClients: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    clients,
    isLoadingClients,
    selectedClient,
    setSelectedClient,
    createClient,
    updateClient,
    deleteClient,
    isCreating,
    isUpdating,
    refetch,
  } = useClientManagement();

  const {
    invitations,
    stats,
    createInvitation,
    isCreatingInvitation,
  } = useClientInvitations();

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

  // Calculate statistics
  const totalClients = clients.length;
  const activeApplications = clients.filter(c => c.status === 'active').length;
  const lmiEligible = clients.filter(c => 
    c.income && c.household_size && c.income < 80000 // Example LMI criteria
  ).length;
  const recentlyAdded = clients.filter(c => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(c.created_at) > weekAgo;
  }).length;

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setShowEditDialog(true);
  };

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setShowDetailsDialog(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(clientId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your mortgage clients and their applications
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Manually
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Client Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">+{recentlyAdded} from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeApplications}</div>
            <p className="text-xs text-muted-foreground">In process</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LMI Eligible</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lmiEligible}</div>
            <p className="text-xs text-muted-foreground">
              {totalClients > 0 ? Math.round((lmiEligible / totalClients) * 100) : 0}% of clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Management Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="invitations" className="relative">
            Invitations
            {stats?.pending > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">
                {stats.pending}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>
                Manage your client relationships and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientTable
                clients={filteredClients}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onView={handleViewClient}
                onRefresh={refetch}
                isLoading={isLoadingClients}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationManagement />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setShowCreateDialog(true)}
            >
              <UserPlus className="h-6 w-6 mb-2" />
              Add New Client
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setShowInviteDialog(true)}
            >
              <Mail className="h-6 w-6 mb-2" />
              Send Invitation
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Follow-up
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Phone className="h-6 w-6 mb-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateClientDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={createClient}
        isLoading={isCreating}
        userType="mortgage_professional"
      />

      <EditClientDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        client={selectedClient}
        onSubmit={updateClient}
        isLoading={isUpdating}
      />

      <ClientDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        client={selectedClient}
      />

      <InviteClientDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSubmit={createInvitation}
        isLoading={isCreatingInvitation}
      />
    </div>
  );
};

export default MortgageClients;
