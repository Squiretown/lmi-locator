import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Mail, Phone, Calendar, ChevronDown, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientManagement } from '@/hooks/useClientManagement';
import { useUnifiedClientData, UnifiedClient, UnifiedClientStatus } from '@/hooks/useUnifiedClientData';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { UnifiedClientTable } from '@/components/clients/UnifiedClientTable';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';

type StatusFilter = 'all' | 'invited' | 'active' | 'inactive';

const MortgageClients: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedClient, setSelectedClient] = useState<UnifiedClient | null>(null);

  const {
    createClient,
    updateClient,
    isCreating,
    isUpdating,
  } = useClientManagement();

  const {
    unifiedClients,
    isLoading,
    stats,
    refetch,
    deleteInvitation,
    reactivateClient,
    deactivateClient,
    deleteClient,
    cancelInvitation,
    isDeleting,
    isReactivating,
    isDeactivating,
    isCancelling,
  } = useUnifiedClientData();

  const { 
    manageInvitation, 
    isManaging: isResendingInvitation 
  } = useUnifiedInvitationSystem();

  // Filter clients based on search query and status filter
  const filteredClients = useMemo(() => {
    return unifiedClients.filter(client => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || (
        client.firstName?.toLowerCase().includes(searchLower) ||
        client.lastName?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(searchQuery)
      );

      // Status filter
      let matchesStatus = true;
      switch (statusFilter) {
        case 'invited':
          matchesStatus = client.status === 'invited';
          break;
        case 'active':
          matchesStatus = client.status === 'active';
          break;
        case 'inactive':
          matchesStatus = ['deactivated', 'expired', 'cancelled'].includes(client.status);
          break;
        case 'all':
        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [unifiedClients, searchQuery, statusFilter]);

  const handleViewClient = (client: UnifiedClient) => {
    setSelectedClient(client);
    setShowDetailsDialog(true);
  };

  const handleEditClient = (client: UnifiedClient) => {
    setSelectedClient(client);
    setShowEditDialog(true);
  };

  const handleResendInvitation = async (client: UnifiedClient) => {
    try {
      await manageInvitation({ 
        invitationId: client.id, 
        action: 'resend', 
        sendVia: (client.sendVia as any) || 'email' 
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReInvite = (client: UnifiedClient) => {
    // Open invite dialog with pre-filled data
    setShowInviteDialog(true);
  };

  // Map UnifiedClient to the format expected by EditClientDialog
  const getClientForEdit = () => {
    if (!selectedClient || selectedClient.source !== 'client_profile') return null;
    return {
      id: selectedClient.id,
      first_name: selectedClient.firstName || '',
      last_name: selectedClient.lastName || '',
      email: selectedClient.email,
      phone: selectedClient.phone || '',
      income: selectedClient.income,
      household_size: selectedClient.householdSize,
      military_status: selectedClient.militaryStatus,
      timeline: selectedClient.timeline,
      first_time_buyer: selectedClient.firstTimeBuyer,
      notes: selectedClient.notes,
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your mortgage clients and invitations in one place
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
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All clients and invitations</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'invited' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('invited')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invited</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.invited}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'active' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('active')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Current clients</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'inactive' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('inactive')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Deactivated / Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="invited" className="text-amber-600">Invited ({stats.invited})</TabsTrigger>
          <TabsTrigger value="active" className="text-green-600">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({stats.inactive})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {statusFilter === 'all' && 'All Clients'}
                {statusFilter === 'invited' && 'Invited Clients'}
                {statusFilter === 'active' && 'Active Clients'}
                {statusFilter === 'inactive' && 'Inactive Clients'}
              </CardTitle>
              <CardDescription>
                {statusFilter === 'all' && 'Complete view of all clients and invitations'}
                {statusFilter === 'invited' && 'Clients who have received an invitation but haven\'t accepted yet'}
                {statusFilter === 'active' && 'Clients currently working with you'}
                {statusFilter === 'inactive' && 'Deactivated, expired, or cancelled clients'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedClientTable
                clients={filteredClients}
                isLoading={isLoading}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onResendInvitation={handleResendInvitation}
                onCancelInvitation={async (id) => {
                  await cancelInvitation(id);
                  setSelectedClient(null);
                }}
                onDeleteInvitation={async (id) => {
                  await deleteInvitation(id);
                  setSelectedClient(null);
                }}
                onDeactivateClient={async (id) => {
                  await deactivateClient(id);
                  setSelectedClient(null);
                }}
                onReactivateClient={async (id) => {
                  await reactivateClient(id);
                  setSelectedClient(null);
                }}
                onDeleteClient={async (id) => {
                  await deleteClient(id);
                  setSelectedClient(null);
                }}
                onReInvite={handleReInvite}
                isDeleting={isDeleting}
                isReactivating={isReactivating}
                isDeactivating={isDeactivating}
                isCancelling={isCancelling}
              />
            </CardContent>
          </Card>
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
        client={getClientForEdit() as any}
        onSubmit={updateClient}
        isLoading={isUpdating}
      />

      <ClientDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        client={selectedClient ? {
          id: selectedClient.id,
          first_name: selectedClient.firstName || '',
          last_name: selectedClient.lastName || '',
          email: selectedClient.email,
          phone: selectedClient.phone,
          income: selectedClient.income,
          household_size: selectedClient.householdSize,
          military_status: selectedClient.militaryStatus,
          timeline: selectedClient.timeline,
          first_time_buyer: selectedClient.firstTimeBuyer,
          notes: selectedClient.notes,
          status: selectedClient.status,
          created_at: selectedClient.createdAt,
        } as any : null}
      />

      <InviteClientDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
};

export default MortgageClients;
