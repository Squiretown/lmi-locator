
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Edit, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface TeamActionsDropdownProps {
  member: any;
  onViewDetails: (member: any) => void;
  onEdit: (member: any) => void;
  onSendEmail: (member: any) => void;
  onSendSMS: (member: any) => void;
  onRemove: (teamId: string) => void;
  onUpdate: () => void;
}

export const TeamActionsDropdown: React.FC<TeamActionsDropdownProps> = ({
  member,
  onViewDetails,
  onEdit,
  onSendEmail,
  onSendSMS,
  onRemove,
  onUpdate,
}) => {
  const handleRemove = async () => {
    await onRemove(member.id);
    onUpdate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border shadow-md">
        <DropdownMenuItem onClick={() => onViewDetails(member)} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onEdit(member)} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit Team Member
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onSendEmail(member)} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onSendSMS(member)} className="cursor-pointer">
          <MessageSquare className="mr-2 h-4 w-4" />
          Send SMS
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from Team
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {member.realtor?.name} from your team? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
