import { useUnifiedInvitationSystem } from './useUnifiedInvitationSystem';

export function useInvitationStats() {
  const { stats, isLoadingInvitations } = useUnifiedInvitationSystem();
  
  // Transform unified stats to match legacy format expected by dashboard components
  return {
    data: [{
      professional_id: '', // Not used in the dashboard components
      status: 'all',
      invitation_count: stats.total,
      email_sent_count: stats.sent,
      sms_sent_count: 0, // Not tracked separately in unified system
      accepted_count: stats.accepted,
      expired_count: stats.expired,
      avg_days_to_accept: 0, // Not calculated in current implementation
      date_created: new Date().toISOString().split('T')[0],
    }],
    isLoading: isLoadingInvitations,
    error: null,
  };
}