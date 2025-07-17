import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientProfile } from '@/hooks/useClientManagement';
import { formatDistanceToNow, format } from 'date-fns';
import { User, Mail, Phone, DollarSign, Home, Calendar, Flag } from 'lucide-react';

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientProfile | null;
}

export const ClientDetailsDialog: React.FC<ClientDetailsDialogProps> = ({
  open,
  onOpenChange,
  client,
}) => {
  if (!client) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'lead':
        return <Badge className="bg-blue-100 text-blue-800">Lead</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.first_name} {client.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(client.status)}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Annual Income:</span>
                <span>{client.income ? `$${client.income.toLocaleString()}` : 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Household Size:</span>
                <span>{client.household_size || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">First-time Buyer:</span>
                <Badge variant={client.first_time_buyer ? "default" : "outline"}>
                  {client.first_time_buyer === null ? 'Unknown' : client.first_time_buyer ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Timeline:</span>
                <span className="capitalize">{client.timeline || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Military Status:</span>
                <span className="capitalize">{client.military_status || 'None'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium">Created:</span>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(client.created_at), 'PPP')}
                  <span className="text-xs ml-2">
                    ({formatDistanceToNow(new Date(client.created_at), { addSuffix: true })})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Last Updated:</span>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(client.updated_at), 'PPP')}
                  <span className="text-xs ml-2">
                    ({formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        {client.notes && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};