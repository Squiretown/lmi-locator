
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Building, Users } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';

export const TeamContent: React.FC = () => {
  const { clientTeams, isLoadingClientTeams: isLoading } = useTeamManagement();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Professional Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientTeams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No professionals assigned to your account yet.
              </p>
            </div>
          ) : (
            clientTeams.map((assignment: any) => (
              <div key={assignment.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{assignment.professional?.name}</h3>
                    <Badge variant={assignment.professional_role === 'mortgage_professional' ? 'default' : 'secondary'}>
                      {assignment.professional_role === 'mortgage_professional' ? 'Mortgage Professional' : 'Realtor'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{assignment.professional?.company}</span>
                  </div>
                  
                  {assignment.professional?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${assignment.professional.phone}`} 
                        className="text-primary hover:underline"
                      >
                        {assignment.professional.phone}
                      </a>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
