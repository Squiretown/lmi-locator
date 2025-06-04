
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock, 
  Activity, 
  Target, 
  BarChart, 
  Users,
  Eye,
  MousePointer
} from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUser } from '../types/admin-user';

interface UserAnalyticsProps {
  user: AdminUser;
}

interface EngagementMetric {
  date: string;
  sessions: number;
  pageViews: number;
  duration: number;
  features_used: string[];
}

interface FeatureUsage {
  feature: string;
  usage_count: number;
  last_used: string;
  success_rate: number;
}

interface LoginActivity {
  date: string;
  login_count: number;
  device_type: string;
  location: string;
  success_rate: number;
}

export const UserAnalytics: React.FC<UserAnalyticsProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [engagementData, setEngagementData] = useState<EngagementMetric[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in real implementation this would come from analytics service
      setEngagementData([
        {
          date: '2024-01-20',
          sessions: 15,
          pageViews: 45,
          duration: 1200,
          features_used: ['property_search', 'saved_properties', 'dashboard']
        },
        {
          date: '2024-01-19',
          sessions: 8,
          pageViews: 22,
          duration: 800,
          features_used: ['property_search', 'eligibility_check']
        }
      ]);

      setFeatureUsage([
        {
          feature: 'Property Search',
          usage_count: 125,
          last_used: '2024-01-20T10:30:00Z',
          success_rate: 95
        },
        {
          feature: 'Eligibility Check',
          usage_count: 78,
          last_used: '2024-01-20T09:15:00Z',
          success_rate: 92
        },
        {
          feature: 'Saved Properties',
          usage_count: 45,
          last_used: '2024-01-19T16:45:00Z',
          success_rate: 100
        },
        {
          feature: 'Professional Connect',
          usage_count: 12,
          last_used: '2024-01-18T14:20:00Z',
          success_rate: 85
        }
      ]);

      setLoginActivity([
        {
          date: '2024-01-20',
          login_count: 3,
          device_type: 'Desktop',
          location: 'New York, NY',
          success_rate: 100
        },
        {
          date: '2024-01-19',
          login_count: 2,
          device_type: 'Mobile',
          location: 'New York, NY',
          success_rate: 100
        },
        {
          date: '2024-01-18',
          login_count: 1,
          device_type: 'Desktop',
          location: 'Newark, NJ',
          success_rate: 67
        }
      ]);

      toast.success('Analytics data loaded successfully');
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsLoading(true);
      toast.info('Generating comprehensive analytics report...');
      
      // Mock report generation
      setTimeout(() => {
        toast.success('Analytics report generated and ready for download');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalSessions = engagementData.reduce((sum, metric) => sum + metric.sessions, 0);
  const totalPageViews = engagementData.reduce((sum, metric) => sum + metric.pageViews, 0);
  const avgDuration = engagementData.length > 0 
    ? Math.round(engagementData.reduce((sum, metric) => sum + metric.duration, 0) / engagementData.length)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            User Analytics & Insights
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} disabled={isLoading}>
              <Activity className="h-4 w-4 mr-2" />
              Load Analytics
            </Button>
            <Button onClick={generateReport} variant="outline" disabled={isLoading}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="space-y-4">
            <TabsList>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="features">Feature Usage</TabsTrigger>
              <TabsTrigger value="logins">Login Analytics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Total Sessions</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Page Views</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{totalPageViews}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Avg Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{Math.floor(avgDuration / 60)}m</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Engagement</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">85%</div>
                  </CardContent>
                </Card>
              </div>

              {engagementData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Page Views</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Features Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engagementData.map((metric, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                            <TableCell>{metric.sessions}</TableCell>
                            <TableCell>{metric.pageViews}</TableCell>
                            <TableCell>{Math.floor(metric.duration / 60)}m</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {metric.features_used.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {feature.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              {featureUsage.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Usage Count</TableHead>
                          <TableHead>Success Rate</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {featureUsage.map((feature, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{feature.feature}</TableCell>
                            <TableCell>{feature.usage_count}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={feature.success_rate} className="w-16" />
                                <span className={`text-sm ${getSuccessColor(feature.success_rate)}`}>
                                  {feature.success_rate}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(feature.last_used).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={feature.success_rate >= 90 ? 'default' : 
                                        feature.success_rate >= 70 ? 'secondary' : 'destructive'}
                              >
                                {feature.success_rate >= 90 ? 'Excellent' : 
                                 feature.success_rate >= 70 ? 'Good' : 'Needs Attention'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="logins" className="space-y-4">
              {loginActivity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Login Activity Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Login Count</TableHead>
                          <TableHead>Device Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loginActivity.map((activity, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                            <TableCell>{activity.login_count}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{activity.device_type}</Badge>
                            </TableCell>
                            <TableCell>{activity.location}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={activity.success_rate} className="w-16" />
                                <span className={`text-sm ${getSuccessColor(activity.success_rate)}`}>
                                  {activity.success_rate}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Task Success Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-24" />
                        <span className="text-green-600 font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Feature Adoption</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-24" />
                        <span className="text-yellow-600 font-medium">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <Progress value={89} className="w-24" />
                        <span className="text-green-600 font-medium">89%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Property Searches</span>
                        <Badge variant="default">↑ 15%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Eligibility Checks</span>
                        <Badge variant="default">↑ 8%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Professional Connects</span>
                        <Badge variant="secondary">↓ 5%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Report Downloads</span>
                        <Badge variant="default">↑ 22%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
