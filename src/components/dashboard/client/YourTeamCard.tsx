import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, Users } from 'lucide-react';

export const YourTeamCard = () => {
  // Stage 1: Get client profile by user_id
  const { data: clientProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['client-profile-by-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      console.log('🔍 Looking up client profile for user:', user.id);
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      
      console.log('📋 Client profile found:', data?.id || 'none');
      return data;
    },
  });

  // Stage 2: Get team assignments (without embedded professionals)
  const { data: assignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useQuery({
    queryKey: ['client-assignments', clientProfile?.id],
    queryFn: async () => {
      if (!clientProfile?.id) return [];
      
      console.log('🔍 Fetching assignments for client:', clientProfile.id);
      const { data, error } = await supabase
        .from('client_team_assignments')
        .select('id, professional_id, professional_role, status')
        .eq('client_id', clientProfile.id)
        .eq('status', 'active');
      if (error) throw error;
      
      console.log('📊 Assignments loaded:', data?.length || 0);
      return data || [];
    },
    enabled: !!clientProfile?.id,
  });

  // Stage 3: Get professionals by IDs
  const professionalIds = Array.from(new Set(assignments.map(a => a.professional_id)));
  
  const { data: professionals = [], isLoading: isLoadingProfessionals, error: professionalsError } = useQuery({
    queryKey: ['professionals-by-ids', professionalIds.join(',')],
    queryFn: async () => {
      if (professionalIds.length === 0) return [];
      
      console.log('🔍 Fetching professionals:', professionalIds);
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, company, email, phone')
        .in('id', professionalIds);
      if (error) throw error;
      
      console.log('👥 Professionals loaded:', data?.length || 0);
      return data || [];
    },
    enabled: professionalIds.length > 0,
    staleTime: 30000,
    retry: 2,
  });

  // Merge assignments with professionals
  const clientTeams = assignments.map(assignment => ({
    ...assignment,
    professionals: professionals.find(p => p.id === assignment.professional_id),
  }));

  const isLoading = isLoadingProfile || isLoadingAssignments || isLoadingProfessionals;
  const hasError = assignmentsError || professionalsError;

  if (isLoading) {
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

  if (hasError) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Your Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-destructive">
            <p className="text-sm">Unable to load team data. Please refresh the page.</p>
          </div>
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
          Contact your team for assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clientTeams.map((assignment: any) => {
          const professional = assignment.professionals;
          if (!professional) {
            return (
              <div key={assignment.id} className="border-l-4 border-l-primary/20 pl-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Contact info unavailable</h4>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {assignment.professional_role === 'mortgage_professional' ? 'Mortgage' : 'Realtor'}
                  </Badge>
                </div>
              </div>
            );
          }
          
          return (
            <div key={assignment.id} className="border-l-4 border-l-primary/20 pl-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-sm">{professional.name}</h4>
                  <p className="text-xs text-muted-foreground">{professional.company || 'Independent'}</p>
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};