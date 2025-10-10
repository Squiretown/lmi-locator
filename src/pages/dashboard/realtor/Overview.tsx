
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Clock, Zap } from 'lucide-react';
import { PropertyChecker } from '@/components/dashboard/realtor/PropertyChecker';
import { RealtorOverview as RealtorOverviewComponent } from '@/components/dashboard/realtor/RealtorOverview';
import { ProfessionalTeam } from '@/components/dashboard/realtor/ProfessionalTeam';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { toast } from 'sonner';

const RealtorOverview: React.FC = () => {
  const { clients } = useRealtorClientManagement();
  const { sendInvitation, stats } = useUnifiedInvitationSystem();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const activeClients = clients.filter(client => client.status === 'active').length;
  const activeInvites = stats.pending + stats.sent; // Invitations that need follow-up

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} - Coming Soon!`, {
      description: 'This feature is currently under development.'
    });
  };

  const handleInviteClient = async (data: any) => {
    // Invitation dialog handles its own logic now
    setInviteDialogOpen(false);
  };

  const actionCards = [
    { 
      title: 'Active Clients', 
      value: activeClients.toString(), 
      icon: Users, 
      color: 'text-blue-500',
      type: 'stat'
    },
    { 
      title: 'Active Invites', 
      value: activeInvites.toString(), 
      icon: Clock, 
      color: 'text-amber-500',
      type: 'stat',
      action: () => handleComingSoon('Invitation Management')
    },
    { 
      title: 'Invite Client', 
      value: 'Quick Action', 
      icon: UserPlus, 
      color: 'text-green-500',
      type: 'action',
      action: () => setInviteDialogOpen(true)
    },
    { 
      title: 'Lead Generator', 
      value: 'Coming Soon', 
      icon: Zap, 
      color: 'text-orange-500',
      type: 'coming-soon',
      action: () => handleComingSoon('Lead Generator')
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Realtor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your realtor portal</p>
      </div>

      {/* Top Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {actionCards.map((card) => (
          <Card 
            key={card.title}
            className={card.type !== 'stat' || card.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            onClick={card.action}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.type === 'action' && (
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto font-normal">
                  Click to {card.title.toLowerCase()}
                </Button>
              )}
              {card.type === 'coming-soon' && (
                <p className="text-xs text-muted-foreground mt-1">Click for updates</p>
              )}
              {card.title === 'Active Invites' && (
                <p className="text-xs text-muted-foreground mt-1">Pending follow-up</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Section - Property Checker and Professional Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PropertyChecker />
        <ProfessionalTeam />
      </div>

      {/* Bottom Section - Recent Activity and Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtorOverviewComponent />
      </div>

      {/* Invite Client Dialog */}
      <InviteClientDialog 
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};

export default RealtorOverview;
