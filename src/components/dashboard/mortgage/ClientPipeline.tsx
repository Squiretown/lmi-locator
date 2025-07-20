import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, FileText, User } from 'lucide-react';
import { useMortgageClientManagement } from '@/hooks/useMortgageClientManagement';

export const ClientPipeline: React.FC = () => {
  const { clients, isLoading } = useMortgageClientManagement();

  const activeClients = clients.filter(client => client.status === 'active');
  const recentLoans = clients.filter(client => 
    client.status === 'active' && 
    new Date(client.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pre_approval': return 'secondary';
      case 'application': return 'outline';
      case 'underwriting': return 'destructive';
      default: return 'secondary';
    }
  };

  const calculateProgress = (client: any) => {
    // Simple progress calculation based on status
    switch (client.status) {
      case 'lead': return 10;
      case 'pre_approval': return 30;
      case 'application': return 60;
      case 'underwriting': return 80;
      case 'active': return 100;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Client Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading pipeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Client Pipeline
          </div>
          <Badge variant="outline">{activeClients.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentLoans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent loan activity</p>
            <p className="text-sm">Your recent client loans will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLoans.map((client) => (
              <div key={client.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {client.first_name} {client.last_name}
                    </span>
                  </div>
                  <Badge variant={getStatusColor(client.status)}>
                    {client.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{calculateProgress(client)}%</span>
                  </div>
                  <Progress value={calculateProgress(client)} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(client.created_at).toLocaleDateString()}
                  </div>
                  {client.timeline && (
                    <span>Timeline: {client.timeline}</span>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" size="sm">
              View All Clients
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};