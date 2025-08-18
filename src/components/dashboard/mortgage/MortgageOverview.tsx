import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, TrendingUp, Calendar, UserPlus } from 'lucide-react';
import { useInvitationStats } from '@/hooks/useInvitationStats';
import { useCRMContacts } from '@/hooks/useCRMContacts';

export const MortgageOverview: React.FC = () => {
  const { data: invitationStats, isLoading: isLoadingStats } = useInvitationStats();
  const { data: contacts, isLoading: isLoadingContacts } = useCRMContacts();

  // Calculate aggregated stats
  const totalInvitations = invitationStats.reduce((sum, stat) => sum + stat.invitation_count, 0);
  const totalAccepted = invitationStats.reduce((sum, stat) => sum + stat.accepted_count, 0);
  const acceptanceRate = totalInvitations > 0 ? Math.round((totalAccepted / totalInvitations) * 100) : 0;
  
  const clientContacts = contacts.filter(contact => contact.contact_type === 'client');
  const professionalContacts = contacts.filter(contact => contact.contact_type === 'professional');
  
  const recentContacts = contacts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientContacts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Network</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionalContacts.length}</div>
            <p className="text-xs text-muted-foreground">
              Professional partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Total invitations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Invitation acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contacts</CardTitle>
          <CardDescription>
            Your most recently updated contacts and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingContacts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {contact.first_name[0]}{contact.last_name?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{contact.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {contact.contact_type === 'client' ? 'Client' : contact.professional_type}
                        {contact.company && ` • ${contact.company}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={contact.contact_type === 'client' ? 'default' : 'secondary'}>
                      {contact.contact_type}
                    </Badge>
                    {contact.phone && (
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    {contact.email && (
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};