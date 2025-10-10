import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedCRM } from '@/hooks/useUnifiedCRM';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  UserPlus,
  MoreHorizontal,
  MessageSquare,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UnifiedContactsViewProps {
  onInviteClick: () => void;
  onAddExistingClick?: () => void;
  filterByType?: 'client' | 'professional' | 'all';
}

export const UnifiedContactsView: React.FC<UnifiedContactsViewProps> = ({
  onInviteClick,
  onAddExistingClick,
  filterByType = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'invited'>('all');
  
  const { allContacts: contacts, isLoading } = useUnifiedCRM();

  const getStatusBadge = (contact: any) => {
    // Check if it's a professional team member (not an invitation)
    if (contact.relationship_type === 'team_member') {
      return <Badge variant="secondary" className="bg-green-500/10 text-green-700">Connected</Badge>;
    }
    
    switch (contact.status) {
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700">Active</Badge>;
      case 'sent':
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">Invited</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-500/10 text-gray-700">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{contact.status}</Badge>;
    }
  };

  const getContactTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      'client': 'Client',
      'professional': 'Professional'
    };
    return <Badge variant="outline" className="text-xs">{labels[type] || type}</Badge>;
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invitation code copied');
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    // Type filter
    if (filterByType !== 'all') {
      if (filterByType !== contact.contact_type) {
        return false;
      }
    }

    // Tab filter
    if (activeTab === 'active') {
      if (contact.relationship_type === 'team_member' || contact.status === 'accepted') {
        // OK
      } else {
        return false;
      }
    } else if (activeTab === 'invited') {
      if (['sent', 'pending'].includes(contact.status)) {
        // OK
      } else {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        contact.full_name?.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.phone?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Contacts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contacts & Network</CardTitle>
            <CardDescription>
              Manage your clients, partners, and invitations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onAddExistingClick && (
              <Button variant="outline" onClick={onAddExistingClick} size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Existing
              </Button>
            )}
            <Button onClick={onInviteClick} size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({contacts.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({contacts.filter(c => c.relationship_type === 'team_member' || c.status === 'accepted').length})
              </TabsTrigger>
              <TabsTrigger value="invited">
                Invited ({contacts.filter(c => ['sent', 'pending'].includes(c.status)).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No contacts match your search.' : 'No contacts yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{contact.full_name}</h4>
                          {getContactTypeBadge(contact.contact_type)}
                          {getStatusBadge(contact)}
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{contact.company}</span>
                          </div>
                        )}
                        {contact.created_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Added {format(new Date(contact.created_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {contact.email && (
                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${contact.email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          {contact.phone && (
                            <DropdownMenuItem onClick={() => window.location.href = `sms:${contact.phone}`}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send SMS
                            </DropdownMenuItem>
                          )}
                          {contact.id && ['sent', 'pending'].includes(contact.status) && (
                            <DropdownMenuItem onClick={() => copyInvitationCode(contact.id!)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Invite Code
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
