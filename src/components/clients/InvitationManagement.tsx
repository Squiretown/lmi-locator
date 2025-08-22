import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CopyInvitationCode } from '@/components/teams/CopyInvitationCode';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { InviteClientDialog } from './InviteClientDialog';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Copy,
  Send,
  RotateCcw,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

export const InvitationManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const {
    invitations,
    isLoadingInvitations: isLoading,
    stats,
    sendInvitation,
    isSending: isCreatingInvitation,
    manageInvitation,
    isManaging: isResendingInvitation,
  } = useUnifiedInvitationSystem();

  // Adapt unified system API to component needs
  const createInvitation = sendInvitation;
  const resendInvitation = (params: { invitationId: string; type?: string }) => 
    manageInvitation({ invitationId: params.invitationId, action: 'resend', sendVia: params.type as any });
  const revokeInvitation = (invitationId: string) => 
    manageInvitation({ invitationId, action: 'cancel' });
  const isSendingInvitation = isCreatingInvitation;
  const isRevokingInvitation = isResendingInvitation;

  // Filter invitations based on search query and archive setting
  const filteredInvitations = invitations.filter(invitation => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      invitation.first_name?.toLowerCase().includes(searchLower) ||
      invitation.last_name?.toLowerCase().includes(searchLower) ||
      invitation.email.toLowerCase().includes(searchLower) ||
      invitation.invite_code.toLowerCase().includes(searchLower)
    );

    const isArchived = ['cancelled', 'expired'].includes(invitation.status);
    
    if (showArchived) {
      return matchesSearch; // Show all when archive toggle is on
    } else {
      return matchesSearch && !isArchived; // Hide archived when toggle is off
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50"><Mail className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvitationTypeBadge = (type: string) => {
    switch (type) {
      case 'email':
        return <Badge variant="secondary" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</Badge>;
      case 'sms':
        return <Badge variant="secondary" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />SMS</Badge>;
      case 'both':
        return <Badge variant="secondary" className="text-xs"><Mail className="h-3 w-3 mr-1" /><MessageSquare className="h-3 w-3" />Both</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{type || 'Email'}</Badge>;
    }
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invitation code copied to clipboard');
  };

  // Remove the broken handleSendInvitation function since unified system sends automatically
  // const handleSendInvitation = async (invitationId: string, type: 'email' | 'sms' | 'both') => {
  //   try {
  //     await sendInvitation({ invitationId, type });
  //   } catch (error) {
  //     // Error handling is done in the hook
  //   }
  // };

  const handleResendInvitation = async (invitationId: string, type: 'email' | 'sms' | 'both' = 'email') => {
    try {
      await resendInvitation({ invitationId, type });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invitations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <Label htmlFor="show-archived" className="text-sm">
              <Archive className="h-4 w-4 inline mr-1" />
              Show archived
            </Label>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Client
          </Button>
        </div>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Invitations ({filteredInvitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading invitations...</div>
          ) : filteredInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No invitations match your search.' : 'No invitations sent yet.'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowInviteDialog(true)} 
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Send Your First Invitation
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left font-medium">Client</th>
                    <th className="p-3 text-left font-medium">Code</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Created</th>
                    <th className="p-3 text-left font-medium">Expires</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((invitation) => (
                    <tr key={invitation.id} className="border-t">
                      <td className="p-3">
                         <div>
                           <div className="font-medium">
                             {invitation.first_name && invitation.last_name ? 
                               `${invitation.first_name} ${invitation.last_name}` : 
                               invitation.first_name || 
                               invitation.last_name || 
                               'No name provided'}
                           </div>
                           <div className="text-sm text-muted-foreground">
                             {invitation.email}
                           </div>
                           {invitation.phone && (
                             <div className="text-xs text-muted-foreground">
                               {invitation.phone}
                             </div>
                           )}
                         </div>
                      </td>
                      <td className="p-3">
                         <div className="flex items-center gap-2">
                           <code className="text-sm bg-muted px-2 py-1 rounded">
                             {invitation.invite_code}
                           </code>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => copyInvitationCode(invitation.invite_code)}
                           >
                             <Copy className="h-3 w-3" />
                           </Button>
                         </div>
                      </td>
                       <td className="p-3">
                         {getInvitationTypeBadge(invitation.send_via)}
                       </td>
                      <td className="p-3">
                        {getStatusBadge(invitation.status)}
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             {invitation.status === 'sent' && (
                               <DropdownMenuItem
                                 onClick={() => handleResendInvitation(invitation.id, invitation.send_via)}
                                 disabled={isResendingInvitation}
                               >
                                 <RotateCcw className="h-4 w-4 mr-2" />
                                 Resend
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuItem
                               onClick={() => copyInvitationCode(invitation.invite_code)}
                             >
                               <Copy className="h-4 w-4 mr-2" />
                               Copy Code
                             </DropdownMenuItem>
                             {['pending', 'sent'].includes(invitation.status) && (
                               <DropdownMenuItem
                                 onClick={() => revokeInvitation(invitation.id)}
                                 disabled={isRevokingInvitation}
                                 className="text-destructive"
                               >
                                 <XCircle className="h-4 w-4 mr-2" />
                                 Revoke
                               </DropdownMenuItem>
                             )}
                           </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteClientDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSubmit={(data) => {
          // Adapt legacy dialog format to unified system format
          return createInvitation({
            email: data.email,
            userType: 'client',
            firstName: data.name?.split(' ')[0],
            lastName: data.name?.split(' ').slice(1).join(' ') || undefined,
            phone: data.phone,
            sendVia: data.invitationType,
            customMessage: data.customMessage,
            propertyInterest: 'buying', // Default value required by unified system
            preferredContact: 'email',
          });
        }}
        isLoading={isCreatingInvitation}
      />
    </div>
  );
};