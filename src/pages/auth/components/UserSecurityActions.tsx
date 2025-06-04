
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, LogOut, Eye, AlertTriangle, Activity, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUser } from '../types/admin-user';

interface UserSecurityActionsProps {
  user: AdminUser;
}

interface UserSession {
  id: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  device_type: string;
  location?: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  timestamp: string;
  ip_address: string;
  details: string;
  risk_level: 'low' | 'medium' | 'high';
}

export const UserSecurityActions: React.FC<UserSecurityActionsProps> = ({ user }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleForceLogout = async () => {
    try {
      setIsLoading(true);
      toast.info('Force logout functionality will be implemented');
      // TODO: Call edge function to end all user sessions
    } catch (error) {
      toast.error('Failed to force logout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSessions = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setSessions([
        {
          id: '1',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/120.0.0.0',
          last_activity: '2024-01-20T10:30:00Z',
          device_type: 'Desktop',
          location: 'New York, NY'
        },
        {
          id: '2',
          ip_address: '10.0.0.50',
          user_agent: 'Safari/17.0',
          last_activity: '2024-01-20T09:15:00Z',
          device_type: 'Mobile',
          location: 'San Francisco, CA'
        }
      ]);
      toast.success('Sessions loaded');
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSecurityEvents = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setSecurityEvents([
        {
          id: '1',
          event_type: 'Failed Login',
          timestamp: '2024-01-20T08:45:00Z',
          ip_address: '192.168.1.100',
          details: 'Multiple failed login attempts',
          risk_level: 'medium'
        },
        {
          id: '2',
          event_type: 'Password Reset',
          timestamp: '2024-01-19T14:20:00Z',
          ip_address: '10.0.0.50',
          details: 'Password reset requested',
          risk_level: 'low'
        },
        {
          id: '3',
          event_type: 'Suspicious Activity',
          timestamp: '2024-01-18T22:10:00Z',
          ip_address: '203.0.113.1',
          details: 'Login from unusual location',
          risk_level: 'high'
        }
      ]);
      toast.success('Security events loaded');
    } catch (error) {
      toast.error('Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setIsLoading(true);
      toast.info('2FA management functionality will be implemented');
      // TODO: Call edge function to enable/disable 2FA
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetSecurityFlag = async () => {
    try {
      setIsLoading(true);
      toast.info('Security flag functionality will be implemented');
      // TODO: Call edge function to set security flags
    } catch (error) {
      toast.error('Failed to set security flag');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleForceLogout} 
              variant="destructive" 
              size="sm"
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Force Logout
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleViewSessions} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Sessions
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Active Sessions for {user.email}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Last Activity</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-mono text-sm">{session.ip_address}</TableCell>
                            <TableCell>{session.device_type}</TableCell>
                            <TableCell>{session.location || 'Unknown'}</TableCell>
                            <TableCell>{new Date(session.last_activity).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Terminate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No active sessions found
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleViewSecurityEvents} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Security Events
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Security Events for {user.email}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {securityEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securityEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>{event.event_type}</TableCell>
                            <TableCell>
                              <Badge variant={getRiskBadgeVariant(event.risk_level)}>
                                {event.risk_level}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{event.ip_address}</TableCell>
                            <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{event.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No security events found
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleToggle2FA} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <Shield className="h-4 w-4 mr-2" />
              Toggle 2FA
            </Button>

            <Button 
              onClick={handleSetSecurityFlag} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Security Flag
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Security actions require admin privileges and will be logged for audit purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
