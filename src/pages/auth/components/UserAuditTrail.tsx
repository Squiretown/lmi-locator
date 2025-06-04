
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Activity, Download, Search, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUser } from '../types/admin-user';

interface UserAuditTrailProps {
  user: AdminUser;
}

interface AuditEvent {
  id: string;
  action: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  details: string;
  result: 'success' | 'failure' | 'warning';
  resource_type?: string;
  resource_id?: string;
}

interface ApiUsageRecord {
  id: string;
  endpoint: string;
  method: string;
  timestamp: string;
  response_time: number;
  status_code: number;
  requests_count: number;
}

export const UserAuditTrail: React.FC<UserAuditTrailProps> = ({ user }) => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  const loadAuditEvents = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setAuditEvents([
        {
          id: '1',
          action: 'User Login',
          timestamp: '2024-01-20T10:30:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/120.0.0.0',
          details: 'Successful login from desktop',
          result: 'success',
          resource_type: 'auth',
          resource_id: user.id
        },
        {
          id: '2',
          action: 'Profile Update',
          timestamp: '2024-01-20T09:15:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/120.0.0.0',
          details: 'Updated email address',
          result: 'success',
          resource_type: 'profile',
          resource_id: user.id
        },
        {
          id: '3',
          action: 'Failed Login',
          timestamp: '2024-01-19T22:45:00Z',
          ip_address: '203.0.113.1',
          user_agent: 'Unknown',
          details: 'Invalid password attempt',
          result: 'failure',
          resource_type: 'auth',
          resource_id: user.id
        },
        {
          id: '4',
          action: 'Password Reset',
          timestamp: '2024-01-19T14:20:00Z',
          ip_address: '10.0.0.50',
          user_agent: 'Safari/17.0',
          details: 'Password reset completed',
          result: 'success',
          resource_type: 'auth',
          resource_id: user.id
        }
      ]);
      toast.success('Audit events loaded');
    } catch (error) {
      toast.error('Failed to load audit events');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApiUsage = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setApiUsage([
        {
          id: '1',
          endpoint: '/api/properties/search',
          method: 'POST',
          timestamp: '2024-01-20T10:30:00Z',
          response_time: 245,
          status_code: 200,
          requests_count: 15
        },
        {
          id: '2',
          endpoint: '/api/user/profile',
          method: 'GET',
          timestamp: '2024-01-20T09:15:00Z',
          response_time: 89,
          status_code: 200,
          requests_count: 8
        },
        {
          id: '3',
          endpoint: '/api/properties/save',
          method: 'POST',
          timestamp: '2024-01-19T16:30:00Z',
          response_time: 156,
          status_code: 201,
          requests_count: 3
        }
      ]);
      toast.success('API usage loaded');
    } catch (error) {
      toast.error('Failed to load API usage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      toast.info('Generating user activity report...');
      // TODO: Call edge function to generate comprehensive report
      setTimeout(() => {
        toast.success('Report generated and ready for download');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case 'success': return 'default';
      case 'failure': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'default';
    if (statusCode >= 400 && statusCode < 500) return 'secondary';
    if (statusCode >= 500) return 'destructive';
    return 'outline';
  };

  const filteredEvents = auditEvents.filter(event => {
    const matchesFilter = filterType === 'all' || event.action.toLowerCase().includes(filterType);
    const matchesSearch = searchQuery === '' || 
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity & Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="login">Login Events</SelectItem>
                <SelectItem value="profile">Profile Changes</SelectItem>
                <SelectItem value="security">Security Events</SelectItem>
                <SelectItem value="api">API Calls</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={loadAuditEvents} variant="outline" size="sm" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Load Activities
            </Button>
            <Button onClick={loadApiUsage} variant="outline" size="sm" disabled={isLoading}>
              <Clock className="h-4 w-4 mr-2" />
              API Usage
            </Button>
            <Button onClick={handleGenerateReport} variant="outline" size="sm" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events Table */}
      {auditEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.action}</TableCell>
                    <TableCell>
                      <Badge variant={getResultBadgeVariant(event.result)}>
                        {event.result}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">{event.ip_address}</TableCell>
                    <TableCell>{event.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* API Usage Table */}
      {apiUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Avg Response Time</TableHead>
                  <TableHead>Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiUsage.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell className="font-mono text-sm">{usage.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{usage.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(usage.status_code)}>
                        {usage.status_code}
                      </Badge>
                    </TableCell>
                    <TableCell>{usage.requests_count}</TableCell>
                    <TableCell>{usage.response_time}ms</TableCell>
                    <TableCell>{new Date(usage.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
