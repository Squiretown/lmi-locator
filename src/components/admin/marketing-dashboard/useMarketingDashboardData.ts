
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface MarketingStats {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  totalJobs: number;
  totalAddresses: number;
  eligibleAddresses: number;
}

interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
}

export function useMarketingDashboardData() {
  const [loading, setLoading] = useState(true);
  const [userTypeCounts, setUserTypeCounts] = useState<Record<string, number>>({});
  const [marketingStats, setMarketingStats] = useState<MarketingStats>({
    pendingJobs: 0,
    processingJobs: 0,
    completedJobs: 0,
    totalJobs: 0,
    totalAddresses: 0,
    eligibleAddresses: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationStats>({
    total: 0,
    read: 0,
    unread: 0,
    byType: {}
  });
  const [verificationChallenges, setVerificationChallenges] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user type counts
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('user_type')
          .not('user_type', 'is', null);
          
        if (userData) {
          const counts: Record<string, number> = {};
          userData.forEach((user) => {
            const type = user.user_type || 'unknown';
            counts[type] = (counts[type] || 0) + 1;
          });
          setUserTypeCounts(counts);
        }

        // Fetch marketing stats
        const { data: marketingData } = await supabase
          .from('marketing_jobs')
          .select('*');
          
        if (marketingData) {
          const stats = {
            pendingJobs: marketingData.filter(job => job.status === 'pending').length,
            processingJobs: marketingData.filter(job => job.status === 'processing').length,
            completedJobs: marketingData.filter(job => job.status === 'completed').length,
            totalJobs: marketingData.length,
            totalAddresses: marketingData.reduce((sum, job) => sum + (job.total_addresses || 0), 0),
            eligibleAddresses: marketingData.reduce((sum, job) => sum + (job.eligible_addresses || 0), 0)
          };
          setMarketingStats(stats);
        }

        // Fetch recent activity
        const { data: activityData } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activityData) {
          setRecentActivity(activityData);
        }

        // Fetch notification stats
        const { data: notificationData } = await supabase
          .from('notifications')
          .select('*');
          
        if (notificationData) {
          const notifStats = {
            total: notificationData.length,
            read: notificationData.filter(n => n.is_read).length,
            unread: notificationData.filter(n => !n.is_read).length,
            byType: {} as Record<string, number>
          };
          
          notificationData.forEach(n => {
            const type = n.notification_type || 'unknown';
            notifStats.byType[type] = (notifStats.byType[type] || 0) + 1;
          });
          
          setNotifications(notifStats);
        }

        // Fetch verification challenges
        const { data: challengeData } = await supabase
          .from('verification_challenges')
          .select('*');
          
        if (challengeData) {
          setVerificationChallenges(challengeData);
        }
      } catch (error) {
        console.error('Error fetching marketing dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    loading,
    userTypeCounts,
    marketingStats,
    recentActivity,
    notifications,
    verificationChallenges
  };
}
