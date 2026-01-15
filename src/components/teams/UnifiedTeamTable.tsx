import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Eye, 
  Mail, 
  Phone,
  Send, 
  Copy, 
  ExternalLink,
  XCircle,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  UserMinus,
  Building
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { UnifiedTeamMember, UnifiedTeamStatus } from '@/hooks/useUnifiedTeamData';
import { Skeleton } from '@/components/ui/skeleton';

interface UnifiedTeamTableProps {
  members: UnifiedTeamMember[];
  isLoading: boolean;
  onView: (member: UnifiedTeamMember) => void;
  onEmail: (member: UnifiedTeamMember) => void;
  onSMS: (member: UnifiedTeamMember) => void;
  onResendInvitation: (member: UnifiedTeamMember) => void;
  onCancelInvitation: (memberId: string) => void;
  onDeleteInvitation: (memberId: string) => void;
  onRemoveTeamMember: (memberId: string) => void;
  onReInvite: (member: UnifiedTeamMember) => void;
  isDeleting?: boolean;
  isCancelling?: boolean;
  isRemoving?: boolean;
}

const statusConfig: Record<UnifiedTeamStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  invited: { label: 'Invited', variant: 'default', icon: Clock },
  active: { label: 'Active', variant: 'secondary', icon: CheckCircle },
  inactive: { label: 'Removed', variant: 'destructive', icon: UserMinus },
  expired: { label: 'Expired', variant: 'outline', icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'outline', icon: Ban },
};

export const UnifiedTeamTable: React.FC<UnifiedTeamTableProps> = ({
  members,
  isLoading,
  onView,
  onEmail,
  onSMS,
  onResendInvitation,
  onCancelInvitation,
  onDeleteInvitation,
  onRemoveTeamMember,
  onReInvite,
  isDeleting,
  isCancelling,
  isRemoving,
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; member: UnifiedTeamMember | null; action: 'delete' | 'remove' }>({
    open: false,
    member: null,
    action: 'delete',
  });

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invitation code copied to clipboard');
  };

  const copyInviteLink = (member: UnifiedTeamMember) => {
    if (!member.inviteToken) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/accept-invitation/${member.inviteToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const getStatusBadge = (status: UnifiedTeamStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: 'realtor' | 'mortgage_professional') => {
    return (
      <Badge variant="outline" className="capitalize">
        {type === 'mortgage_professional' ? 'Mortgage Pro' : 'Realtor'}
      </Badge>
    );
  };

  const handleActionConfirm = () => {
    if (!deleteDialog.member) return;
    
    if (deleteDialog.action === 'delete') {
      onDeleteInvitation(deleteDialog.member.id);
    } else {
      onRemoveTeamMember(deleteDialog.member.id);
    }
    setDeleteDialog({ open: false, member: null, action: 'delete' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
          <Building className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium">No team members found</h3>
        <p className="text-muted-foreground mt-1">
          Start building your team by inviting partners.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">{member.email}</span>
                    {member.phone && (
                      <span className="text-xs text-muted-foreground">{member.phone}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(member.professionalType)}</TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell>
                  <span className="text-sm">{member.company || '-'}</span>
                  {member.licenseNumber && (
                    <span className="block text-xs text-muted-foreground">
                      License: {member.licenseNumber}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(member.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* View - always available */}
                      <DropdownMenuItem onClick={() => onView(member)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {/* Actions for INVITED members */}
                      {member.status === 'invited' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onResendInvitation(member)}>
                            <Send className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                          {member.inviteCode && (
                            <DropdownMenuItem onClick={() => copyInvitationCode(member.inviteCode!)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Code
                            </DropdownMenuItem>
                          )}
                          {member.inviteToken && (
                            <DropdownMenuItem onClick={() => copyInviteLink(member)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Copy Invite Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onCancelInvitation(member.id)}
                            disabled={isCancelling}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Actions for ACTIVE members */}
                      {member.status === 'active' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEmail(member)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          {member.phone && (
                            <DropdownMenuItem onClick={() => onSMS(member)}>
                              <Phone className="mr-2 h-4 w-4" />
                              Send SMS
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, member, action: 'remove' })}
                            disabled={isRemoving}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from Team
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Actions for EXPIRED/CANCELLED invitations */}
                      {(member.status === 'expired' || member.status === 'cancelled') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onReInvite(member)}>
                            <Send className="mr-2 h-4 w-4" />
                            Re-invite
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, member, action: 'delete' })}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, member: deleteDialog.member, action: deleteDialog.action })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.action === 'delete' ? (
                <>
                  Are you sure you want to delete this invitation for <strong>{deleteDialog.member?.email}</strong>?
                  This will permanently remove the invitation.
                </>
              ) : (
                <>
                  Are you sure you want to remove <strong>{deleteDialog.member?.name}</strong> from your team?
                  They will no longer appear in your team list.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActionConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDialog.action === 'delete' ? 'Delete' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
