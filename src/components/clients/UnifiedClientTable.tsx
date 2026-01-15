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
  Edit, 
  Mail, 
  MessageSquare, 
  Send, 
  Copy, 
  ExternalLink,
  XCircle,
  Trash2,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  UserX
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { UnifiedClient, UnifiedClientStatus } from '@/hooks/useUnifiedClientData';
import { Skeleton } from '@/components/ui/skeleton';

interface UnifiedClientTableProps {
  clients: UnifiedClient[];
  isLoading: boolean;
  onView: (client: UnifiedClient) => void;
  onEdit: (client: UnifiedClient) => void;
  onResendInvitation: (client: UnifiedClient) => void;
  onCancelInvitation: (clientId: string) => void;
  onDeleteInvitation: (clientId: string) => void;
  onDeactivateClient: (clientId: string) => void;
  onReactivateClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onReInvite: (client: UnifiedClient) => void;
  isDeleting?: boolean;
  isReactivating?: boolean;
  isDeactivating?: boolean;
  isCancelling?: boolean;
}

const statusConfig: Record<UnifiedClientStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  invited: { label: 'Invited', variant: 'default', icon: Clock },
  active: { label: 'Active', variant: 'secondary', icon: CheckCircle },
  deactivated: { label: 'Deactivated', variant: 'destructive', icon: UserX },
  expired: { label: 'Expired', variant: 'outline', icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'outline', icon: Ban },
};

export const UnifiedClientTable: React.FC<UnifiedClientTableProps> = ({
  clients,
  isLoading,
  onView,
  onEdit,
  onResendInvitation,
  onCancelInvitation,
  onDeleteInvitation,
  onDeactivateClient,
  onReactivateClient,
  onDeleteClient,
  onReInvite,
  isDeleting,
  isReactivating,
  isDeactivating,
  isCancelling,
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; client: UnifiedClient | null }>({
    open: false,
    client: null,
  });

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invitation code copied to clipboard');
  };

  const copyInviteLink = (client: UnifiedClient) => {
    if (!client.inviteToken) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/accept-invitation/${client.inviteToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const getStatusBadge = (status: UnifiedClientStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.client) return;
    
    if (deleteDialog.client.source === 'invitation') {
      onDeleteInvitation(deleteDialog.client.id);
    } else {
      onDeleteClient(deleteDialog.client.id);
    }
    setDeleteDialog({ open: false, client: null });
  };

  const getDisplayName = (client: UnifiedClient) => {
    if (client.firstName && client.lastName) {
      return `${client.firstName} ${client.lastName}`;
    }
    if (client.firstName) return client.firstName;
    return client.email.split('@')[0];
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

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium">No clients found</h3>
        <p className="text-muted-foreground mt-1">
          Get started by inviting or adding a new client.
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
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{getDisplayName(client)}</span>
                    <span className="text-sm text-muted-foreground">{client.email}</span>
                    {client.phone && (
                      <span className="text-xs text-muted-foreground">{client.phone}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(client.status)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {client.source === 'invitation' ? 'Invited' : 'Manual'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
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
                      <DropdownMenuItem onClick={() => onView(client)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {/* Actions for INVITED clients */}
                      {client.status === 'invited' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onResendInvitation(client)}>
                            <Send className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                          {client.inviteCode && (
                            <DropdownMenuItem onClick={() => copyInvitationCode(client.inviteCode!)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Code
                            </DropdownMenuItem>
                          )}
                          {client.inviteToken && (
                            <DropdownMenuItem onClick={() => copyInviteLink(client)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Copy Invite Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onCancelInvitation(client.id)}
                            disabled={isCancelling}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Actions for ACTIVE clients */}
                      {client.status === 'active' && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeactivateClient(client.id)}
                            disabled={isDeactivating}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Actions for DEACTIVATED clients */}
                      {client.status === 'deactivated' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onReactivateClient(client.id)}
                            disabled={isReactivating}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, client })}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Actions for EXPIRED/CANCELLED invitations */}
                      {(client.status === 'expired' || client.status === 'cancelled') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onReInvite(client)}>
                            <Send className="mr-2 h-4 w-4" />
                            Re-invite
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, client })}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, client: deleteDialog.client })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.client?.source === 'invitation' ? (
                <>
                  Are you sure you want to delete this invitation for <strong>{deleteDialog.client?.email}</strong>?
                  This will permanently remove the invitation and they will no longer be able to accept it.
                </>
              ) : (
                <>
                  Are you sure you want to delete <strong>{getDisplayName(deleteDialog.client!)}</strong>?
                  This will permanently remove their profile and all associated data. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
