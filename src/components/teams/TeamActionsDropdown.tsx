
import React, { useState } from 'react';
import { MoreHorizontal, UserX, Mail, MessageSquare, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMemberCommunicationDialog } from './TeamMemberCommunicationDialog';
import { TeamMemberDetailsDialog } from './TeamMemberDetailsDialog';
import { TeamMemberEditDialog } from './TeamMemberEditDialog';

interface TeamMember {
  id: string;
  realtor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company: string;
    license_number: string;
  };
  status: string;
  notes?: string;
  created_at: string;
}

interface TeamActionsDropdownProps {
  member: TeamMember;
  onRemove: (memberId: string) => void;
  onUpdate: () => void;
}

export const TeamActionsDropdown: React.FC<TeamActionsDropdownProps> = ({
  member,
  onRemove,
  onUpdate,
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');

  const handleSendEmail = () => {
    setCommunicationType('email');
    setShowCommunicationDialog(true);
  };

  const handleSendSMS = () => {
    setCommunicationType('sms');
    setShowCommunicationDialog(true);
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      onRemove(member.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background border shadow-md z-50">
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Team Member
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {member.realtor?.email && (
            <DropdownMenuItem onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
          )}
          {member.realtor?.phone && (
            <DropdownMenuItem onClick={handleSendSMS}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send SMS
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleRemove}
            className="text-destructive focus:text-destructive"
          >
            <UserX className="mr-2 h-4 w-4" />
            Remove from Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TeamMemberDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        member={member}
      />

      <TeamMemberEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={member}
        onUpdate={() => {
          onUpdate();
          setShowEditDialog(false);
        }}
      />

      <TeamMemberCommunicationDialog
        open={showCommunicationDialog}
        onOpenChange={setShowCommunicationDialog}
        member={member}
        type={communicationType}
      />
    </>
  );
};
