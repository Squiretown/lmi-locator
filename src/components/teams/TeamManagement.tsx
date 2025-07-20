
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Phone, Building } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useForm } from 'react-hook-form';
import { TeamActionsDropdown } from './TeamActionsDropdown';

interface InviteRealtorData {
  email: string;
  name?: string;
  customMessage?: string;
}

export const TeamManagement: React.FC = () => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { 
    teamMembers, 
    isLoadingTeam, 
    inviteRealtor, 
    removeTeamMember,
    isInvitingRealtor,
  } = useTeamManagement();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteRealtorData>();

  const onInviteRealtor = async (data: InviteRealtorData) => {
    try {
      await inviteRealtor(data);
      setShowInviteDialog(false);
      reset();
    } catch (error) {
      console.error('Failed to invite realtor:', error);
    }
  };

  const handleRemoveMember = async (teamId: string) => {
    await removeTeamMember(teamId);
  };

  const handleUpdateTeam = () => {
    // This would typically refetch the team data
    console.log('Team updated, refreshing data...');
  };

  if (isLoadingTeam) {
    return <div>Loading team...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Realtor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Realtor to Team</DialogTitle>
              <DialogDescription>
                Send an invitation to a realtor to join your team
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onInviteRealtor)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="realtor@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Name (Optional)</label>
                <Input
                  {...register('name')}
                  placeholder="Realtor's full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Custom Message (Optional)</label>
                <Textarea
                  {...register('customMessage')}
                  placeholder="Add a personal message to the invitation..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isInvitingRealtor}>
                  {isInvitingRealtor ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Team Members Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your team by inviting realtor partners
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Your First Realtor
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
    </div>
  );
};
