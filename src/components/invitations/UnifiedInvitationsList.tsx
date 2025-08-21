import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Archive,
  Building,
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import type { UserInvitation, UserType, InvitationStatus, SendVia } from '@/types/unified-invitations';

interface UnifiedInvitationsListProps {
  onInviteClick: () => void;
  showFilters?: boolean;
}

export const UnifiedInvitationsList: React.FC<UnifiedInvitationsListProps> = ({
  onInviteClick,
  showFilters = true
}) => {
  const {
    invitations,
    stats,
    filters,
    isLoadingInvitations,
    isManaging,
    updateFilters,
    clearFilters,
    manageInvitation,
    copyInvitationCode,
    copyInvitationLink
  } = useUnifiedInvitationSystem();

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showArchived, setShowArchived] = useState(false);

  // Handle search with debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchQuery });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, updateFilters]);

  // Filter invitations based on archive setting
  const filteredInvitations = invitations.filter(invitation => {
    const isArchived = ['cancelled', 'expired'].includes(invitation.status);
    return showArchived || !isArchived;
  });

  const getStatusBadge = (status: InvitationStatus) => {
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

  const getUserTypeBadge = (userType: UserType) => {
    switch (userType) {
      case 'client':
        return <Badge variant="secondary" className="text-xs"><Users className="h-3 w-3 mr-1" />Client</Badge>;
      case 'realtor':
        return <Badge variant="secondary" className="text-xs"><Building className="h-3 w-3 mr-1" />Realtor</Badge>;
      case 'mortgage_professional':
        return <Badge variant="secondary" className="text-xs"><DollarSign className="h-3 w-3 mr-1" />Mortgage Pro</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{userType}</Badge>;
    }
  };

  const getSendViaBadge = (sendVia: SendVia) => {
    switch (sendVia) {
      case 'email':
        return <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</Badge>;
      case 'sms':
        return <Badge variant="outline" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />SMS</Badge>;
      case 'both':
        return <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3 mr-1" /><MessageSquare className="h-3 w-3" />Both</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{sendVia}</Badge>;
    }
  };

  const handleResend = async (invitation: UserInvitation) => {
    try {
      await manageInvitation({
        invitationId: invitation.id,
        action: 'resend',
        sendVia: invitation.send_via
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = async (invitation: UserInvitation) => {
    try {
      await manageInvitation({
        invitationId: invitation.id,
        action: 'cancel'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <Button onClick={onInviteClick}>
              <Plus className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </div>
      )}

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations ({filteredInvitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingInvitations ? (
            <div className="text-center py-8">Loading invitations...</div>
          ) : filteredInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No invitations match your search.' : 'No invitations sent yet.'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={onInviteClick} 
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
                    <th className="p-3 text-left font-medium">User</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Code</th>
                    <th className="p-3 text-left font-medium">Method</th>
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
                            {invitation.first_name || invitation.last_name 
                              ? `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim()
                              : 'No name provided'
                            }
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
                        {getUserTypeBadge(invitation.user_type)}
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
                        {getSendViaBadge(invitation.send_via)}
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
                            {['pending', 'sent'].includes(invitation.status) && (
                              <DropdownMenuItem
                                onClick={() => handleResend(invitation)}
                                disabled={isManaging}
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
                            <DropdownMenuItem
                              onClick={() => copyInvitationLink(invitation)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            {['pending', 'sent'].includes(invitation.status) && (
                              <DropdownMenuItem
                                onClick={() => handleCancel(invitation)}
                                disabled={isManaging}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
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
    </div>
  );
};