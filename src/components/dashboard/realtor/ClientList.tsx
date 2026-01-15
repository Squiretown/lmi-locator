import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Clock, CheckCircle, XCircle, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, UserPlus } from 'lucide-react';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';
import { useUnifiedClientData, UnifiedClient } from '@/hooks/useUnifiedClientData';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { UnifiedClientTable } from '@/components/clients/UnifiedClientTable';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type StatusFilter = 'all' | 'invited' | 'active' | 'inactive';

export const ClientList = () => {
  const {
    createClient,
    updateClient,
    isCreating,
    isUpdating,
  } = useRealtorClientManagement();

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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UnifiedClient | null>(null);

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Total Clients</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'invited' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('invited')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Invited</div>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600">{stats.invited}</div>
          </div>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'active' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('active')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Active</div>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'inactive' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('inactive')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="text-sm font-medium">Inactive</div>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
          </div>
        </Card>
      </div>

      {/* Status Filter Tabs with Actions Bar */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="invited" className="text-amber-600">Invited ({stats.invited})</TabsTrigger>
            <TabsTrigger value="active" className="text-green-600">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({stats.inactive})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
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
        </div>

        <TabsContent value={statusFilter} className="space-y-4">
          <Card>
            <div className="flex justify-between items-center p-6 pb-0">
              <h2 className="text-xl font-semibold">
                {statusFilter === 'all' && `All Clients (${filteredClients.length})`}
                {statusFilter === 'invited' && `Invited Clients (${filteredClients.length})`}
                {statusFilter === 'active' && `Active Clients (${filteredClients.length})`}
                {statusFilter === 'inactive' && `Inactive Clients (${filteredClients.length})`}
              </h2>
            </div>
            <CardContent>
              <UnifiedClientTable
                clients={filteredClients}
                isLoading={isLoading}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onResendInvitation={handleResendInvitation}
                onCancelInvitation={cancelInvitation}
                onDeleteInvitation={deleteInvitation}
                onDeactivateClient={deactivateClient}
                onReactivateClient={reactivateClient}
                onDeleteClient={deleteClient}
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

      {/* Dialogs */}
      <CreateClientDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={createClient}
        isLoading={isCreating}
        userType="realtor"
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
