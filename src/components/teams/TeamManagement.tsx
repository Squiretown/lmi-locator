
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Phone, Building, ArrowLeft } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { TeamActionsDropdown } from './TeamActionsDropdown';
import { TeamMemberDetailsDialog } from './TeamMemberDetailsDialog';
import { TeamMemberEditDialog } from './TeamMemberEditDialog';
import { TeamMemberCommunicationDialog } from './TeamMemberCommunicationDialog';
import { InviteProfessionalDialog } from './InviteProfessionalDialog';
import { useNavigate } from 'react-router-dom';

export const TeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');

  const { 
    teamMembers, 
    isLoadingTeam, 
    removeTeamMember,
  } = useTeamManagement();

  const handleBackToDashboard = () => {
    navigate('/dashboard/realtor');
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
        <Button onClick={() => setShowInviteDialog(true)} className="bg-primary">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Professional
        </Button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Team Members Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your team by inviting professional partners
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Your First Professional
              </Button>
            </CardContent>
          </Card>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{member.realtor?.name}</CardTitle>
                    <CardDescription>{member.realtor?.company}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Realtor</Badge>
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
                {member.realtor?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.realtor.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>License: {member.realtor?.license_number}</span>
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
          ))
        )}
      </div>

      {/* Dialogs */}
      <InviteProfessionalDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
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
