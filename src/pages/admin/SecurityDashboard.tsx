import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Lock, 
  RefreshCw, 
  FileDown,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SecurityAlert {
  alert_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  affected_users: string[];
  event_count: number;
  first_seen: string;
  last_seen: string;
  ip_addresses: string[];
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: 'critical' | 'high' | 'info' | 'warning';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, variant }) => {
  const colors = {
    critical: 'text-destructive',
    high: 'text-orange-500',
    info: 'text-primary',
    warning: 'text-yellow-500'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={colors[variant]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

const SecurityDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Calculate time range
      const since = new Date();
      switch (timeRange) {
        case '1h':
          since.setHours(since.getHours() - 1);
          break;
        case '6h':
          since.setHours(since.getHours() - 6);
          break;
        case '24h':
          since.setHours(since.getHours() - 24);
          break;
        case '7d':
          since.setDate(since.getDate() - 7);
          break;
      }

      const { data, error } = await supabase.rpc('check_security_alerts', {
        p_since: since.toISOString(),
        p_severity: ['critical', 'high', 'medium'],
        p_unacknowledged_only: true
      });

      if (error) throw error;

      setAlerts((data as SecurityAlert[]) || []);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();

    // Set up real-time subscription
    const channel = supabase
      .channel('security-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log',
          filter: 'severity=in.(critical,high)'
        },
        (payload) => {
          toast.error('New security alert detected!', {
            description: payload.new.description
          });
          loadSecurityData();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [timeRange]);

  const acknowledgeAlert = async (eventIds: string[]) => {
    try {
      const { data, error } = await supabase.rpc('acknowledge_security_alert', {
        p_event_ids: eventIds
      });

      if (error) throw error;

      const result = data as any;
      toast.success(`Acknowledged ${result?.acknowledged_count || 0} alert(s)`);
      loadSecurityData();
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const sendTestAlert = async () => {
    try {
      const { data, error } = await supabase.rpc('create_test_security_alert');

      if (error) throw error;

      toast.success('Test alert created');
      loadSecurityData();
    } catch (error: any) {
      console.error('Error creating test alert:', error);
      toast.error('Failed to create test alert');
    }
  };

  const exportReport = () => {
    const csv = [
      ['Severity', 'Type', 'Message', 'Event Count', 'First Seen', 'Last Seen', 'IP Addresses'].join(','),
      ...alerts.map(alert => [
        alert.severity,
        alert.alert_type,
        `"${alert.message}"`,
        alert.event_count,
        alert.first_seen,
        alert.last_seen,
        `"${alert.ip_addresses.join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    a.click();
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;
  const totalEvents = alerts.reduce((sum, a) => sum + a.event_count, 0);
  const failedLogins = alerts.filter(a => a.alert_type.includes('login')).reduce((sum, a) => sum + a.event_count, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Last updated: {format(lastUpdated, 'PPpp')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSecurityData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Critical Alerts"
          value={criticalCount}
          icon={<ShieldAlert className="h-4 w-4" />}
          variant="critical"
        />
        <MetricCard
          title="High Priority Events"
          value={highCount}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant="high"
        />
        <MetricCard
          title={`Total Events (${timeRange})`}
          value={totalEvents}
          icon={<Activity className="h-4 w-4" />}
          variant="info"
        />
        <MetricCard
          title="Failed Logins"
          value={failedLogins}
          icon={<Lock className="h-4 w-4" />}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Test and manage security features</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={sendTestAlert} variant="outline">
            Send Test Alert
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/system-logs'}>
            View All Security Logs
          </Button>
        </CardContent>
      </Card>

      {/* Time Range Tabs */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
        <TabsList>
          <TabsTrigger value="1h">Last Hour</TabsTrigger>
          <TabsTrigger value="6h">Last 6 Hours</TabsTrigger>
          <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="mt-6">
          {/* Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                {alerts.length} unacknowledged alert(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading security data...
                </div>
              ) : alerts.length === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    No security alerts found for this time period. Your system is secure!
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <Card key={alert.alert_id} className="border-l-4" style={{
                        borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' :
                                       alert.severity === 'high' ? 'hsl(var(--orange))' :
                                       'hsl(var(--yellow))'
                      }}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {alert.alert_type}
                                </span>
                              </div>
                              <CardTitle className="mt-2">{alert.message}</CardTitle>
                              <CardDescription className="mt-1">
                                {alert.event_count} event(s) • 
                                First seen: {format(new Date(alert.first_seen), 'PPp')} • 
                                Last seen: {format(new Date(alert.last_seen), 'PPp')}
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const eventIds = alert.details.events.map((e: any) => e.id);
                                acknowledgeAlert(eventIds);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Acknowledge
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {alert.ip_addresses.length > 0 && (
                              <div>
                                <strong>IP Addresses:</strong> {alert.ip_addresses.join(', ')}
                              </div>
                            )}
                            {alert.affected_users.length > 0 && (
                              <div>
                                <strong>Affected Users:</strong> {alert.affected_users.length} user(s)
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
