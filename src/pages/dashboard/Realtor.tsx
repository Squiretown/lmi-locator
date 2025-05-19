
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRealtorByUserId, createRealtor, updateRealtor, RealtorFormValues } from '@/lib/api/realtors';
import { toast } from 'sonner';
import RealtorDialog from '@/components/realtors/RealtorDialog';
import { RealtorHeader } from '@/components/dashboard/realtor/RealtorHeader';
import { StatCards } from '@/components/dashboard/realtor/StatCards';
import { PropertyActivityChart } from '@/components/dashboard/realtor/PropertyActivityChart';
import { ClientList } from '@/components/dashboard/realtor/ClientList';
import { ProfileWarning } from '@/components/dashboard/realtor/ProfileWarning';
import { TeamContent } from '@/components/dashboard/client/TeamContent';
import { useNavigate } from 'react-router-dom';

const RealtorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: realtorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['realtorProfile'],
    queryFn: getRealtorByUserId
  });

  useEffect(() => {
    if (!isLoadingProfile && !realtorProfile && user) {
      toast.info('Complete your realtor profile to access all features', {
        action: {
          label: 'Set up now',
          onClick: () => setProfileDialogOpen(true)
        },
        duration: 8000
      });
    }
  }, [realtorProfile, isLoadingProfile, user]);

  const createRealtorMutation = useMutation({
    mutationFn: createRealtor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtorProfile'] });
      toast.success('Profile created successfully');
      setProfileDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const updateRealtorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: RealtorFormValues }) => 
      updateRealtor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtorProfile'] });
      toast.success('Profile updated successfully');
      setProfileDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleProfileSubmit = async (data: RealtorFormValues) => {
    if (realtorProfile) {
      await updateRealtorMutation.mutateAsync({ id: realtorProfile.id, data });
    } else {
      await createRealtorMutation.mutateAsync(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <RealtorHeader
        onEditProfile={() => setProfileDialogOpen(true)}
        onSignOut={handleSignOut}
        showCreateProfile={!realtorProfile}
      />
      
      {!realtorProfile && !isLoadingProfile && (
        <ProfileWarning onCreateProfile={() => setProfileDialogOpen(true)} />
      )}
      
      <StatCards />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <PropertyActivityChart />
        <div className="md:col-span-1">
          <TeamContent />
        </div>
      </div>
      
      <ClientList />

      <RealtorDialog 
        isOpen={profileDialogOpen}
        setIsOpen={setProfileDialogOpen}
        onSubmit={handleProfileSubmit}
        defaultValues={realtorProfile || undefined}
        isLoading={createRealtorMutation.isPending || updateRealtorMutation.isPending}
        title={realtorProfile ? "Edit Realtor Profile" : "Create Realtor Profile"}
      />
    </div>
  );
};

export default RealtorDashboard;
