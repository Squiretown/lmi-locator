import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClientInvitations } from '@/hooks/useClientInvitations';
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
  RotateCcw
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
  const {
    invitations,
    isLoading,
    stats,
    createInvitation,
    isCreatingInvitation,
    sendInvitation,
    isSendingInvitation,
    resendInvitation,
    isResendingInvitation,
    revokeInvitation,
    isRevokingInvitation,
  } = useClientInvitations();

  // Filter invitations based on search query
  const filteredInvitations = invitations.filter(invitation => {
    const searchLower = searchQuery.toLowerCase();
    return (
      invitation.client_name?.toLowerCase().includes(searchLower) ||
      invitation.client_email.toLowerCase().includes(searchLower) ||
      invitation.invitation_code.toLowerCase().includes(searchLower)
    );
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
      case 'revoked':
        return <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
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
        return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invitation code copied to clipboard');
  };

  const handleSendInvitation = async (invitationId: string, type: 'email' | 'sms' | 'both') => {
    try {
      await sendInvitation({ invitationId, type });
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
        
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Client
        </Button>
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
                            {invitation.client_name || 'No name provided'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invitation.client_email}
                          </div>
                          {invitation.client_phone && (
                            <div className="text-xs text-muted-foreground">
                              {invitation.client_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {invitation.invitation_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInvitationCode(invitation.invitation_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        {getInvitationTypeBadge(invitation.invitation_type)}
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
                            {invitation.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => handleSendInvitation(invitation.id, invitation.invitation_type)}
                                disabled={isSendingInvitation}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Invitation
                              </DropdownMenuItem>
                            )}
                            {invitation.status === 'sent' && (
                              <DropdownMenuItem
                                onClick={() => resendInvitation(invitation.id)}
                                disabled={isResendingInvitation}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => copyInvitationCode(invitation.invitation_code)}
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
        onSubmit={createInvitation}
        isLoading={isCreatingInvitation}
      />
    </div>
  );
};