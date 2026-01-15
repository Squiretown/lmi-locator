import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Search, Send, ChevronDown, Clock, CheckCircle, XCircle, Building } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMortgageTeamStats } from '@/hooks/useMortgageTeamStats';
import { useUnifiedTeamData, UnifiedTeamMember } from '@/hooks/useUnifiedTeamData';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { UnifiedTeamTable } from '@/components/teams/UnifiedTeamTable';
import { InviteProfessionalDialog } from '@/components/teams/InviteProfessionalDialog';
import { AddManualProfessionalDialog } from '@/components/teams/AddManualProfessionalDialog';
import { TeamMemberDetailsDialog } from '@/components/teams/TeamMemberDetailsDialog';
import { TeamMemberCommunicationDialog } from '@/components/teams/TeamMemberCommunicationDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type StatusFilter = 'all' | 'invited' | 'active' | 'inactive';

const MortgageTeam: React.FC = () => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showManualAddDialog, setShowManualAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UnifiedTeamMember | null>(null);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { performanceMetrics, isLoading: isLoadingStats } = useMortgageTeamStats();
  
  const {
    unifiedTeam,
    isLoading: isLoadingTeam,
    stats,
    getPartnerTypeLabel,
    deleteInvitation,
    cancelInvitation,
    removeTeamMember,
    isDeleting,
    isCancelling,
    isRemoving,
  } = useUnifiedTeamData();

  const { manageInvitation, isManaging } = useUnifiedInvitationSystem();

  // Filter team members based on search query and status filter
  const filteredMembers = useMemo(() => {
    return unifiedTeam.filter(member => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || (
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.company?.toLowerCase().includes(searchLower)
      );

      // Status filter
      let matchesStatus = true;
      switch (statusFilter) {
        case 'invited':
          matchesStatus = member.status === 'invited';
          break;
        case 'active':
          matchesStatus = member.status === 'active';
          break;
        case 'inactive':
          matchesStatus = ['inactive', 'expired', 'cancelled'].includes(member.status);
          break;
        case 'all':
        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [unifiedTeam, searchQuery, statusFilter]);

  const handleViewMember = (member: UnifiedTeamMember) => {
    setSelectedMember(member);
    setShowDetailsDialog(true);
  };

  const handleEmailMember = (member: UnifiedTeamMember) => {
    setSelectedMember(member);
    setCommunicationType('email');
    setShowCommunicationDialog(true);
  };

  const handleSMSMember = (member: UnifiedTeamMember) => {
    setSelectedMember(member);
    setCommunicationType('sms');
    setShowCommunicationDialog(true);
  };

  const handleResendInvitation = async (member: UnifiedTeamMember) => {
    try {
      await manageInvitation({
        invitationId: member.id,
        action: 'resend',
        sendVia: (member.sendVia as any) || 'email'
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReInvite = (member: UnifiedTeamMember) => {
    setShowInviteDialog(true);
  };

  const isLoading = isLoadingStats || isLoadingTeam;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team & Partners</h1>
            <p className="text-muted-foreground">
              Manage your lending team and realtor partnerships
            </p>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-12 mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team & Partners</h1>
          <p className="text-muted-foreground">
            Manage your {getPartnerTypeLabel().toLowerCase()} partnerships in one place
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Partner
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowManualAddDialog(true)}>
              <Search className="mr-2 h-4 w-4" />
              Add Existing {getPartnerTypeLabel()}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
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
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All partners and invitations</p>
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
            <p className="text-xs text-muted-foreground">Current partners</p>
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
            <p className="text-xs text-muted-foreground">Removed / Expired</p>
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
                {statusFilter === 'all' && 'All Partners'}
                {statusFilter === 'invited' && 'Invited Partners'}
                {statusFilter === 'active' && 'Active Partners'}
                {statusFilter === 'inactive' && 'Inactive Partners'}
              </CardTitle>
              <CardDescription>
                {statusFilter === 'all' && `Complete view of all ${getPartnerTypeLabel().toLowerCase()} partnerships`}
                {statusFilter === 'invited' && `${getPartnerTypeLabel()}s who have received an invitation but haven't accepted yet`}
                {statusFilter === 'active' && `${getPartnerTypeLabel()}s currently in your network`}
                {statusFilter === 'inactive' && 'Removed, expired, or cancelled partnerships'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedTeamTable
                members={filteredMembers}
                isLoading={isLoadingTeam}
                onView={handleViewMember}
                onEmail={handleEmailMember}
                onSMS={handleSMSMember}
                onResendInvitation={handleResendInvitation}
                onCancelInvitation={cancelInvitation}
                onDeleteInvitation={deleteInvitation}
                onRemoveTeamMember={removeTeamMember}
                onReInvite={handleReInvite}
                isDeleting={isDeleting}
                isCancelling={isCancelling}
                isRemoving={isRemoving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Partnership Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Performance</CardTitle>
          <CardDescription>
            Track the success of your partnerships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Referrals Received</span>
                  <span className="font-semibold">{performanceMetrics?.thisMonth.referralsReceived || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Closed Loans</span>
                  <span className="font-semibold">{performanceMetrics?.thisMonth.closedLoans || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">{performanceMetrics?.thisMonth.conversionRate || 0}%</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Last Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Referrals Received</span>
                  <span className="font-semibold">{performanceMetrics?.lastMonth.referralsReceived || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Closed Loans</span>
                  <span className="font-semibold">{performanceMetrics?.lastMonth.closedLoans || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">{performanceMetrics?.lastMonth.conversionRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <InviteProfessionalDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <AddManualProfessionalDialog
        open={showManualAddDialog}
        onOpenChange={setShowManualAddDialog}
        professionalType="realtor"
      />

      {selectedMember && (
        <>
          <TeamMemberDetailsDialog
            member={{
              id: selectedMember.id,
              realtor: {
                id: selectedMember.id,
                name: selectedMember.name,
                company: selectedMember.company || '',
                email: selectedMember.email,
                phone: selectedMember.phone,
                license_number: selectedMember.licenseNumber || '',
              },
              created_at: selectedMember.createdAt,
              status: selectedMember.status,
              notes: selectedMember.notes,
            }}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />

          <TeamMemberCommunicationDialog
            member={{
              id: selectedMember.id,
              realtor: {
                id: selectedMember.id,
                name: selectedMember.name,
                company: selectedMember.company || '',
                email: selectedMember.email,
                phone: selectedMember.phone,
                license_number: selectedMember.licenseNumber || '',
              },
              created_at: selectedMember.createdAt,
              status: selectedMember.status,
            }}
            type={communicationType}
            open={showCommunicationDialog}
            onOpenChange={setShowCommunicationDialog}
          />
        </>
      )}
    </div>
  );
};

export default MortgageTeam;
