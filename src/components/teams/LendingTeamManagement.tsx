import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  MoreVertical,
  UserMinus,
  Settings,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLendingTeamManagement } from '@/hooks/useLendingTeamManagement';
import { InviteLendingTeamMemberDialog } from './InviteLendingTeamMemberDialog';
import { AddExistingTeamMemberDialog } from './AddExistingTeamMemberDialog';

export const LendingTeamManagement: React.FC = () => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const {
    lendingTeamMembers,
    availableProfessionals,
    isLoadingTeam,
    removeTeamMember,
    isRemoving,
  } = useLendingTeamManagement();

  const handleRemoveTeamMember = (teamMemberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      removeTeamMember(teamMemberId);
    }
  };

  if (isLoadingTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lending Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lending Team ({lendingTeamMembers.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              disabled={availableProfessionals.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Existing
            </Button>
            <Button
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lendingTeamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No team members yet</p>
            <p className="text-sm mb-4">Start building your lending team by adding mortgage professionals</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={availableProfessionals.length === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Existing Professional
              </Button>
              <Button
                size="sm"
                onClick={() => setShowInviteDialog(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Invite New Professional
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {lendingTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {member.professional.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.professional.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {member.role.replace('_', ' ')}
                      </Badge>
                      {member.status === 'active' && member.joined_at && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Active
                        </Badge>
                      )}
                      {!member.joined_at && (
                        <Badge variant="outline" className="text-xs text-yellow-600">
                          Invited
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {member.professional.company}
                      </div>
                      {member.professional.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.professional.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Role & Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleRemoveTeamMember(member.id)}
                      disabled={isRemoving}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove from Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <InviteLendingTeamMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
      
      <AddExistingTeamMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </Card>
  );
};