
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

type NotificationSummary = {
  unread_count: number;
  read_count: number;
  total_count: number;
};

type MarketingSummary = {
  pending_count: number;
  processing_count: number;
  completed_count: number;
  total_addresses: number;
  eligible_addresses: number;
};

type UserTypeSummary = {
  user_type: string;
  count: number;
};

type Challenge = {
  id: string;
  question: string;
  answers: string[];
  difficulty: number;
  is_active: boolean;
};

const MarketingDashboard = () => {
  const [notificationStats, setNotificationStats] = useState<NotificationSummary | null>(null);
  const [marketingStats, setMarketingStats] = useState<MarketingSummary | null>(null);
  const [userTypeStats, setUserTypeStats] = useState<UserTypeSummary[]>([]);
  const [verificationChallenges, setVerificationChallenges] = useState<Challenge[]>([]);
  const [newChallenge, setNewChallenge] = useState<{
    question: string;
    answers: string;
    difficulty: string;
  }>({
    question: '',
    answers: '',
    difficulty: '1',
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch notification stats using our helper function
      const { data: notificationData, error: notificationError } = await supabase.rpc(
        'get_notification_counts',
        { user_uuid: null } // null means all users for admin view
      );

      if (notificationError) throw notificationError;
      setNotificationStats(notificationData[0] || { unread_count: 0, read_count: 0, total_count: 0 });

      // Fetch marketing stats using our helper function
      const { data: marketingData, error: marketingError } = await supabase.rpc(
        'get_marketing_summary',
        { user_uuid: null } // null means all users for admin view
      );

      if (marketingError) throw marketingError;
      setMarketingStats(marketingData[0] || {
        pending_count: 0,
        processing_count: 0,
        completed_count: 0,
        total_addresses: 0,
        eligible_addresses: 0
      });

      // Fetch user type distribution
      const { data: userTypeData, error: userTypeError } = await supabase
        .from('user_profiles')
        .select('user_type, count')
        .execute();

      if (userTypeError) throw userTypeError;
      
      // Transform the data into the format we need
      const transformedUserTypeData: UserTypeSummary[] = [];
      if (userTypeData) {
        const userTypeMap = new Map<string, number>();
        userTypeData.forEach((item: any) => {
          const type = item.user_type || 'unknown';
          userTypeMap.set(type, (userTypeMap.get(type) || 0) + 1);
        });
        
        userTypeMap.forEach((count, user_type) => {
          transformedUserTypeData.push({ user_type, count });
        });
      }
      
      setUserTypeStats(transformedUserTypeData.length > 0 ? transformedUserTypeData : [
        { user_type: 'standard', count: 0 },
        { user_type: 'admin', count: 0 },
        { user_type: 'realtor', count: 0 }
      ]);

      // Fetch verification challenges
      const { data: challengeData, error: challengeError } = await supabase
        .from('verification_challenges')
        .select('*')
        .order('difficulty', { ascending: true });

      if (challengeError) throw challengeError;
      setVerificationChallenges(challengeData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addVerificationChallenge = async () => {
    if (!newChallenge.question || !newChallenge.answers) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Split answers by comma and trim whitespace
      const answersArray = newChallenge.answers.split(',').map(a => a.trim());

      const { error } = await supabase
        .from('verification_challenges')
        .insert({
          question: newChallenge.question,
          answers: answersArray,
          difficulty: parseInt(newChallenge.difficulty),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Verification challenge added successfully',
      });

      // Reset form and refetch data
      setNewChallenge({
        question: '',
        answers: '',
        difficulty: '1',
      });
      fetchDashboardData();

    } catch (error) {
      console.error('Error adding verification challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to add verification challenge',
        variant: 'destructive',
      });
    }
  };

  const toggleChallengeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('verification_challenges')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Challenge ${currentStatus ? 'disabled' : 'enabled'} successfully`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling challenge status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update challenge status',
        variant: 'destructive',
      });
    }
  };

  // Prepare data for charts
  const notificationChartData = notificationStats ? [
    { name: 'Unread', value: notificationStats.unread_count },
    { name: 'Read', value: notificationStats.read_count }
  ] : [];

  const marketingStatusData = marketingStats ? [
    { name: 'Pending', value: marketingStats.pending_count },
    { name: 'Processing', value: marketingStats.processing_count },
    { name: 'Completed', value: marketingStats.completed_count }
  ] : [];

  const conversionRate = marketingStats && marketingStats.total_addresses > 0
    ? (marketingStats.eligible_addresses / marketingStats.total_addresses) * 100
    : 0;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Marketing & Administration Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>System notification statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={notificationChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {notificationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total: {notificationStats?.total_count || 0} notifications
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Marketing Campaigns</CardTitle>
            <CardDescription>Campaign status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketingStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total campaigns: {marketingStatusData.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>User Types</CardTitle>
            <CardDescription>Distribution of user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="user_type"
                    label={({ user_type, percent }) => `${user_type}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total users: {userTypeStats.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Performance</CardTitle>
            <CardDescription>Address verification and eligibility metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Eligible Properties</span>
                <span className="text-sm font-medium">
                  {marketingStats?.eligible_addresses || 0} / {marketingStats?.total_addresses || 0}
                </span>
              </div>
              <Progress value={conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {conversionRate.toFixed(1)}% of properties are eligible for LMI programs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Challenges</CardTitle>
            <CardDescription>Anti-bot verification management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="existing">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Existing Challenges</TabsTrigger>
                <TabsTrigger value="add">Add New</TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {verificationChallenges.length === 0 ? (
                    <p className="text-muted-foreground">No challenges found.</p>
                  ) : (
                    verificationChallenges.map((challenge) => (
                      <div key={challenge.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{challenge.question}</p>
                            <p className="text-sm text-muted-foreground">
                              Answers: {challenge.answers.join(', ')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={challenge.difficulty > 1 ? "secondary" : "outline"}>
                                Level {challenge.difficulty}
                              </Badge>
                              <Badge variant={challenge.is_active ? "outline" : "destructive"}>
                                {challenge.is_active ? "Active" : "Disabled"}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant={challenge.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleChallengeStatus(challenge.id, challenge.is_active)}
                          >
                            {challenge.is_active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="add">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Textarea 
                      id="question"
                      placeholder="Enter verification question..." 
                      value={newChallenge.question}
                      onChange={(e) => setNewChallenge({...newChallenge, question: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="answers">Answers (comma separated)</Label>
                    <Textarea 
                      id="answers"
                      placeholder="blue, sky blue" 
                      value={newChallenge.answers}
                      onChange={(e) => setNewChallenge({...newChallenge, answers: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple acceptable answers with commas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <RadioGroup 
                      defaultValue="1" 
                      value={newChallenge.difficulty}
                      onValueChange={(value) => setNewChallenge({...newChallenge, difficulty: value})}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="level1" />
                        <Label htmlFor="level1">Easy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="level2" />
                        <Label htmlFor="level2">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="level3" />
                        <Label htmlFor="level3">Hard</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button 
                    onClick={addVerificationChallenge}
                    className="w-full"
                  >
                    Add Challenge
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingDashboard;
