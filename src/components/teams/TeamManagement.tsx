
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Phone, Building, ArrowLeft, Search, Send, ChevronDown } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { TeamActionsDropdown } from './TeamActionsDropdown';
import { TeamMemberDetailsDialog } from './TeamMemberDetailsDialog';
import { TeamMemberEditDialog } from './TeamMemberEditDialog';
import { TeamMemberCommunicationDialog } from './TeamMemberCommunicationDialog';
import { InviteProfessionalDialog } from './InviteProfessionalDialog';
import { AddManualProfessionalDialog } from './AddManualProfessionalDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

export const TeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showManualAddDialog, setShowManualAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');

  const { 
    teamMembers, 
    currentProfessional,
    isLoadingTeam, 
    removeTeamMember,
  } = useTeamManagement();

  // Get the appropriate partner based on user role
  const getPartnerFromTeam = (team: any) => {
    if (currentProfessional?.professionalType === 'mortgage_professional') {
      return team.realtor;
    } else if (currentProfessional?.professionalType === 'realtor') {
      return team.mortgageProfessional;
    }
    return null;
  };

  // Get the role label for the current user's partners
  const getPartnerRoleLabel = () => {
    if (currentProfessional?.professionalType === 'mortgage_professional') {
      return 'Realtors';
    } else if (currentProfessional?.professionalType === 'realtor') {
      return 'Mortgage Professionals';
    }
    return 'Team Members';
  };

  const handleBackToDashboard = () => {
    // Navigate to appropriate dashboard based on user role
    if (currentProfessional?.professionalType === 'realtor') {
      navigate('/dashboard/realtor');
    } else if (currentProfessional?.professionalType === 'mortgage_professional') {
      navigate('/dashboard/mortgage');
    } else {
      navigate('/dashboard');
    }
  };

  const handleViewDetails = (member: any) => {
    setSelectedMember(member);
    setShowDetailsDialog(true);
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setShowEditDialog(true);
  };

  const handleSendCommunication = (member: any, type: 'email' | 'sms') => {
    setSelectedMember(member);
    setCommunicationType(type);
    setShowCommunicationDialog(true);
  };

  const handleRemoveMember = async (teamId: string) => {
    await removeTeamMember(teamId);
  };

  const handleUpdateTeam = () => {
    // This would typically refetch the team data
    console.log('Team updated, refreshing data...');
  };

  if (isLoadingTeam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Professional
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Professional
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowManualAddDialog(true)}>
              <Search className="mr-2 h-4 w-4" />
              Add Existing {currentProfessional?.professionalType === 'mortgage_professional' ? 'Realtor' : 'Mortgage Professional'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send Invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No {getPartnerRoleLabel()} Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your team by inviting {getPartnerRoleLabel().toLowerCase()}
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Your First Professional
              </Button>
            </CardContent>
          </Card>
        ) : (
          teamMembers.map((member) => {
            const partner = getPartnerFromTeam(member);
            const partnerType = currentProfessional?.professionalType === 'mortgage_professional' ? 'Realtor' : 'Mortgage Professional';
            
            return (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{partner?.name || 'Unknown'}</CardTitle>
                      <CardDescription>{partner?.company || 'No company'}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{partnerType}</Badge>
                      <TeamActionsDropdown
                        member={member}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditMember}
                        onSendEmail={(member) => handleSendCommunication(member, 'email')}
                        onSendSMS={(member) => handleSendCommunication(member, 'sms')}
                        onRemove={handleRemoveMember}
                        onUpdate={handleUpdateTeam}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {partner?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>License: {partner?.license_number || 'Not provided'}</span>
                  </div>

                  {member.notes && (
                    <div className="text-sm text-muted-foreground">
                      <p>{member.notes}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">
                      Added {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <InviteProfessionalDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />

      <AddManualProfessionalDialog
        open={showManualAddDialog}
        onOpenChange={setShowManualAddDialog}
        professionalType={currentProfessional?.professionalType === 'mortgage_professional' ? 'realtor' : 'mortgage_professional'}
      />

      {selectedMember && (
        <>
          <TeamMemberDetailsDialog
            member={selectedMember}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />

          <TeamMemberEditDialog
            member={selectedMember}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onUpdate={handleUpdateTeam}
          />

          <TeamMemberCommunicationDialog
            member={selectedMember}
            type={communicationType}
            open={showCommunicationDialog}
            onOpenChange={setShowCommunicationDialog}
          />
        </>
      )}
    </div>
  );
};
