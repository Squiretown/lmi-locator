
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, TrendingUp, Settings } from 'lucide-react';
import { PropertyChecker } from '@/components/dashboard/realtor/PropertyChecker';
import { TeamVisibilityManager } from '@/components/teams/TeamVisibilityManager';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';
import { useMortgageClientManagement } from '@/hooks/useMortgageClientManagement';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { useMortgageTeamStats } from '@/hooks/useMortgageTeamStats';
import { toast } from 'sonner';

const MortgageOverview: React.FC = () => {
  const { clients } = useMortgageClientManagement();
  const { sendInvitation, stats: inviteStats } = useUnifiedInvitationSystem();
  const { stats } = useMortgageTeamStats();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const activeClients = clients.filter(client => client.status === 'active').length;
  const activeInvites = inviteStats.pending + inviteStats.sent;

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
      title: 'Properties Analyzed', 
      value: stats.propertiesAnalyzed.toString(), 
      icon: TrendingUp, 
      color: 'text-green-500',
      type: 'stat'
    },
    { 
      title: 'Invite Client', 
      value: 'Quick Action', 
      icon: UserPlus, 
      color: 'text-purple-500',
      type: 'action',
      action: () => setInviteDialogOpen(true)
    },
    { 
      title: 'Team Visibility', 
      value: 'Manage Team', 
      icon: Settings, 
      color: 'text-orange-500',
      type: 'action',
      action: () => {
        // Scroll to team visibility section
        const teamSection = document.querySelector('[data-team-visibility]');
        if (teamSection) {
          teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Mortgage Professional Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your mortgage portal</p>
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
                  Click to {card.title === 'Team Visibility' ? 'manage' : card.title.toLowerCase()}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Section - Property Checker and Team Visibility Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PropertyChecker />
        <div data-team-visibility>
          <TeamVisibilityManager />
        </div>
      </div>

      {/* Invite Client Dialog */}
      <InviteClientDialog 
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};

export default MortgageOverview;
