
import React, { useState, useEffect } from 'react';
import PropertyChecker from '@/components/PropertyChecker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentSearches } from '@/components/dashboard/mortgage/RecentSearches';
import { ClientSavedProperties } from './ClientSavedProperties';
import { YourTeamCard } from './YourTeamCard';
import { supabase } from '@/integrations/supabase/client';

export const ClientDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('search');

  // Sync client profile on first login
  useEffect(() => {
    const syncClientProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if client_profiles has user_id set
      const { data: existingProfile } = await supabase
        .from('client_profiles')
        .select('id, user_id, professional_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) return; // Already synced

      // Try to find by email and update
      const { data: profileByEmail } = await supabase
        .from('client_profiles')
        .select('id, professional_id')
        .eq('email', user.email)
        .maybeSingle();

      if (profileByEmail) {
        // Update existing profile with user_id
        await supabase
          .from('client_profiles')
          .update({ user_id: user.id })
          .eq('id', profileByEmail.id);

        // Check if team assignments exist, if not create them
        const { data: assignments } = await supabase
          .from('client_team_assignments')
          .select('id')
          .eq('client_id', profileByEmail.id)
          .limit(1);

        if (!assignments || assignments.length === 0) {
          // Create team assignments
          const invitedBy = user.user_metadata?.invited_by;
          if (invitedBy) {
            const { data: inviterPro } = await supabase
              .from('professionals')
              .select('id')
              .eq('user_id', invitedBy)
              .maybeSingle();

            if (inviterPro) {
              // Determine role from professional_teams
              const { data: asRealtor } = await supabase
                .from('professional_teams')
                .select('id')
                .eq('realtor_id', inviterPro.id)
                .eq('status', 'active')
                .maybeSingle();

              const { data: asMortgage } = await supabase
                .from('professional_teams')
                .select('id')
                .eq('mortgage_professional_id', inviterPro.id)
                .eq('status', 'active')
                .maybeSingle();

              const inviterRole = asRealtor ? 'realtor' : (asMortgage ? 'mortgage_professional' : 'realtor');

              // Add inviter
              await supabase.from('client_team_assignments').insert({
                client_id: profileByEmail.id,
                professional_id: inviterPro.id,
                professional_role: inviterRole,
                status: 'active',
                assigned_by: inviterPro.id,
              });

              // Add team partner if exists
              const { data: teamPartner } = await supabase
                .from('professional_teams')
                .select('mortgage_professional_id, realtor_id')
                .or(`realtor_id.eq.${inviterPro.id},mortgage_professional_id.eq.${inviterPro.id}`)
                .eq('status', 'active')
                .maybeSingle();

              if (teamPartner) {
                const partnerId = inviterRole === 'realtor'
                  ? teamPartner.mortgage_professional_id
                  : teamPartner.realtor_id;
                const partnerRole = inviterRole === 'realtor'
                  ? 'mortgage_professional'
                  : 'realtor';

                if (partnerId) {
                  await supabase.from('client_team_assignments').insert({
                    client_id: profileByEmail.id,
                    professional_id: partnerId,
                    professional_role: partnerRole,
                    status: 'active',
                    assigned_by: inviterPro.id,
                  });
                }
              }
            }
          }
        }
      }
    };

    syncClientProfile();
  }, []);

  const handleAddressSelect = (address: string) => {
    // Switch to search tab and let PropertyChecker handle the address
    setActiveTab('search');
    // The PropertyChecker component will need to handle pre-filling the address
    // This could be enhanced later with a prop or context
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Property Search</TabsTrigger>
              <TabsTrigger value="recent">Recent Searches</TabsTrigger>
              <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="mt-6">
              <PropertyChecker />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-6">
              <RecentSearches />
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6">
              <ClientSavedProperties onAddressSelect={handleAddressSelect} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:sticky lg:top-6 lg:self-start">
          <YourTeamCard />
        </div>
      </div>
    </div>
  );
};
