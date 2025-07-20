
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Mail, Phone, Building } from "lucide-react";
import { useMortgageTeamStats } from '@/hooks/useMortgageTeamStats';
import { useMortgageTeamManagement } from '@/hooks/useMortgageTeamManagement';
import { InviteProfessionalDialog } from '@/components/teams/InviteProfessionalDialog';

const MortgageTeam: React.FC = () => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { teamStats, performanceMetrics, isLoading: isLoadingStats } = useMortgageTeamStats();
  const { 
    lendingTeam, 
    realtorPartners, 
    isLoading: isLoadingTeam, 
    contactProfessional,
    isContacting 
  } = useMortgageTeamManagement();

  const handleContactProfessional = async (professionalId: string, type: 'email' | 'phone') => {
    try {
      await contactProfessional({ professionalId, type });
    } catch (error) {
      console.error('Failed to contact professional:', error);
    }
  };

  if (isLoadingStats || isLoadingTeam) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team & Partners</h1>
            <p className="text-muted-foreground">
              Manage your lending team and realtor partnerships
            </p>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Partner
          </Button>
        </div>

        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-12 mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team & Partners</h1>
          <p className="text-muted-foreground">
            Manage your lending team and realtor partnerships
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Partner
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats?.teamMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Loan officers and staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Realtors</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats?.partnerRealtors || 0}</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats?.sharedClients || 0}</div>
            <p className="text-xs text-muted-foreground">Co-managed transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Lending Team */}
      <Card>
        <CardHeader>
          <CardTitle>Lending Team</CardTitle>
          <CardDescription>
            Your internal lending team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lendingTeam.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No team members found. Invite colleagues to join your lending team.
              </p>
              <Button onClick={() => setShowInviteDialog(true)} variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {lendingTeam.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Active</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContactProfessional(member.id, 'email')}
                      disabled={isContacting}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    {member.phone && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactProfessional(member.id, 'phone')}
                        disabled={isContacting}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Realtor Partners */}
      <Card>
        <CardHeader>
          <CardTitle>Realtor Partners</CardTitle>
          <CardDescription>
            Your trusted realtor partners for client referrals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {realtorPartners.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No realtor partners yet. Start building your referral network.
              </p>
              <Button onClick={() => setShowInviteDialog(true)} variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Realtor Partner
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {realtorPartners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {partner.realtor?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'R'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{partner.realtor?.name || 'Unknown'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {partner.realtor?.company || 'No company'} • License: {partner.realtor?.license_number || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">Partner</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContactProfessional(partner.realtor_id, 'email')}
                      disabled={isContacting}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    {partner.realtor?.phone && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactProfessional(partner.realtor_id, 'phone')}
                        disabled={isContacting}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partnership Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Performance</CardTitle>
          <CardDescription>
            Track the success of your partnerships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Referrals Received</span>
                  <span className="font-semibold">{performanceMetrics?.thisMonth.referralsReceived || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Closed Loans</span>
                  <span className="font-semibold">{performanceMetrics?.thisMonth.closedLoans || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">{performanceMetrics?.thisMonth.conversionRate || 0}%</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Last Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Referrals Received</span>
                  <span className="font-semibold">{performanceMetrics?.lastMonth.referralsReceived || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Closed Loans</span>
                  <span className="font-semibold">{performanceMetrics?.lastMonth.closedLoans || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">{performanceMetrics?.lastMonth.conversionRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteProfessionalDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />
    </div>
  );
};

export default MortgageTeam;
