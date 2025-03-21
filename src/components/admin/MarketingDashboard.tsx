import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from '@/components/LoadingSpinner';

export const MarketingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userTypeCounts, setUserTypeCounts] = useState<Record<string, number>>({});
  const [marketingStats, setMarketingStats] = useState({
    pendingJobs: 0,
    processingJobs: 0,
    completedJobs: 0,
    totalJobs: 0,
    totalAddresses: 0,
    eligibleAddresses: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState({
    total: 0,
    read: 0,
    unread: 0,
    byType: {} as Record<string, number>
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

  if (loading) {
    return <LoadingSpinner />;
  }

  // Prepare data for charts
  const userTypeChartData = Object.keys(userTypeCounts).map(key => ({
    name: key,
    data: userTypeCounts[key]
  }));

  const marketingStatusChartData = [
    { name: 'Pending', data: marketingStats.pendingJobs },
    { name: 'Processing', data: marketingStats.processingJobs },
    { name: 'Completed', data: marketingStats.completedJobs }
  ];

  const notificationTypeChartData = Object.keys(notifications.byType).map(key => ({
    name: key,
    data: notifications.byType[key]
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
      
      {/* User Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Types</CardTitle>
            <CardDescription>Distribution of users by type</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 w-60">
              <Chart type="pie" data={userTypeChartData} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Statistics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Notification Statistics</CardTitle>
            <CardDescription>Overview of system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{notifications.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{notifications.read}</div>
                <div className="text-sm text-gray-500">Read</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{notifications.unread}</div>
                <div className="text-sm text-gray-500">Unread</div>
              </div>
            </div>
            <div className="h-40">
              <Chart type="pie" data={notificationTypeChartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Marketing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.totalJobs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.totalAddresses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eligible Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.eligibleAddresses}</div>
            <div className="text-sm text-gray-500">
              {marketingStats.totalAddresses ? 
                `${Math.round((marketingStats.eligibleAddresses / marketingStats.totalAddresses) * 100)}%` : 
                '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Marketing Job Status</CardTitle>
            <CardDescription>Current status of marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 w-60">
              <Chart type="pie" data={marketingStatusChartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-b pb-2">
                  <div className="font-medium">{activity.activity_type}</div>
                  <div className="text-sm">{activity.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Challenges</CardTitle>
          <CardDescription>Active verification questions for anti-bot measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationChallenges.map((challenge) => (
              <div key={challenge.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div className="font-medium">{challenge.question}</div>
                  <Badge variant={challenge.is_active ? "default" : "destructive"}>
                    {challenge.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-gray-500">Difficulty:</span> {challenge.difficulty}
                </div>
                <div className="text-sm mt-1">
                  <span className="text-gray-500">Answers:</span> {challenge.answers.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
