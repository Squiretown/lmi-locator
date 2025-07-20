
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, ArrowRight } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useNavigate } from 'react-router-dom';

export const ProfessionalTeam: React.FC = () => {
  const { teamMembers, isLoadingTeam } = useTeamManagement();
  const navigate = useNavigate();

  const handleManageTeam = () => {
    navigate('/dashboard/realtor/team');
  };

  if (isLoadingTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Professional Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Professional Team
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Collaborate with mortgage professionals and other experts
        </p>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No team members yet. Start building your professional network.
            </p>
            <Button onClick={handleManageTeam} variant="outline" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              Manage Team
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.slice(0, 3).map((member) => (
              <div key={member.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {member.realtor?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {member.realtor?.company || 'No company listed'}
                  </div>
                  <div className="flex items-center gap-3">
                    {member.realtor?.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.realtor.phone}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {member.status}
                </Badge>
              </div>
            ))}
            
            <div className="text-center pt-2">
              <Button onClick={handleManageTeam} variant="ghost" size="sm">
                {teamMembers.length > 3 ? `View All (${teamMembers.length})` : 'Manage Team'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
