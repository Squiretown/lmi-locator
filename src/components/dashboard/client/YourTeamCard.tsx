import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, Users, Calendar } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { format } from 'date-fns';

export const YourTeamCard = () => {
  const { clientTeams, isLoadingClientTeams } = useTeamManagement();

  if (isLoadingClientTeams) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Your Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!clientTeams || clientTeams.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Your Team</CardTitle>
          </div>
          <CardDescription>
            Your assigned professionals will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No team members assigned yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your Team</CardTitle>
        </div>
        <CardDescription>
          Your assigned professionals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clientTeams.map((assignment) => (
          <div key={assignment.id} className="border-l-4 border-l-primary/20 pl-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm">{assignment.professional_name}</h4>
                <p className="text-xs text-muted-foreground">{assignment.professional_company}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {assignment.professional_role === 'mortgage_professional' ? 'Mortgage' : 'Realtor'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              {assignment.professional_phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 justify-start text-xs"
                  onClick={() => window.open(`tel:${assignment.professional_phone}`)}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {assignment.professional_phone}
                </Button>
              )}
              {assignment.professional_email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 justify-start text-xs"
                  onClick={() => window.open(`mailto:${assignment.professional_email}`)}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  {assignment.professional_email}
                </Button>
              )}
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Assigned {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};