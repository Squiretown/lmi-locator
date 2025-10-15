import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const YourTeamCard = () => {
  // Fetch client's team assignments
  const { data: clientTeams = [], isLoading: isLoadingClientTeams } = useQuery({
    queryKey: ['client-team-assignments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get the client profile for this user
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !clientProfile) {
        console.log('No client profile found for user');
        return [];
      }

      // Then get team assignments for this client
      const { data, error } = await supabase
        .from('client_team_assignments')
        .select(`
          id,
          professional_id,
          professional_role,
          assigned_at,
          professionals!inner (
            id,
            name,
            company_name,
            email,
            phone,
            type
          )
        `)
        .eq('client_id', clientProfile.id)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    },
  });

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
        {clientTeams.map((assignment: any) => {
          const professional = assignment.professionals;
          return (
            <div key={assignment.id} className="border-l-4 border-l-primary/20 pl-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-sm">{professional.name}</h4>
                  <p className="text-xs text-muted-foreground">{professional.company_name}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {assignment.professional_role === 'mortgage_professional' ? 'Mortgage' : 'Realtor'}
                </Badge>
              </div>
              
              <div className="space-y-1">
                {professional.phone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 justify-start text-xs"
                    onClick={() => window.open(`tel:${professional.phone}`)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    {professional.phone}
                  </Button>
                )}
                {professional.email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 justify-start text-xs"
                    onClick={() => window.open(`mailto:${professional.email}`)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {professional.email}
                  </Button>
                )}
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Assigned {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};