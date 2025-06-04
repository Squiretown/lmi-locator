
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Users, 
  TrendingUp, 
  FileText,
  Info
} from 'lucide-react';
import type { AdminUser } from '../types/admin-user';

interface ProfessionalActionDialogProps {
  user: AdminUser | null;
  action: string | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (data?: any) => void;
}

export const ProfessionalActionDialog: React.FC<ProfessionalActionDialogProps> = ({
  user,
  action,
  open,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !action) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onConfirm(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogContent = () => {
    switch (action) {
      case 'verifyLicense':
        return {
          title: 'Verify Professional License',
          icon: <Shield className="h-5 w-5 text-green-600" />,
          description: `Verify the professional license for ${user.email}`,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This will mark the user's license as verified in the system.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  placeholder="Enter license number"
                />
              </div>
              <div>
                <Label htmlFor="verificationNotes">Verification Notes</Label>
                <Textarea
                  id="verificationNotes"
                  value={formData.verificationNotes || ''}
                  onChange={(e) => setFormData({...formData, verificationNotes: e.target.value})}
                  placeholder="Add any verification notes..."
                  rows={3}
                />
              </div>
            </div>
          )
        };

      case 'viewClients':
        return {
          title: 'Client Relationships',
          icon: <Users className="h-5 w-5 text-blue-600" />,
          description: `View clients associated with ${user.email}`,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This will show all clients connected to this professional.
                </AlertDescription>
              </Alert>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Client management features will be displayed here. This includes:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Active client connections</li>
                  <li>Referral relationships</li>
                  <li>Client activity history</li>
                  <li>Communication logs</li>
                </ul>
              </div>
            </div>
          )
        };

      case 'reviewMarketing':
        return {
          title: 'Marketing Campaign Review',
          icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
          description: `Review marketing activities for ${user.email}`,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm font-medium">Active Campaigns</div>
                  <div className="text-2xl font-bold text-blue-600">3</div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm font-medium">Total Leads</div>
                  <div className="text-2xl font-bold text-green-600">127</div>
                </div>
              </div>
              <div>
                <Label>Campaign Performance</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q4 Home Buyers</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First-Time Buyer Program</span>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case 'approveApplication':
        return {
          title: 'Approve Application',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          description: `Approve professional application for ${user.email}`,
          content: (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  This will approve the user's professional application and grant full access.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="approvalNotes">Approval Notes</Label>
                <Textarea
                  id="approvalNotes"
                  value={formData.approvalNotes || ''}
                  onChange={(e) => setFormData({...formData, approvalNotes: e.target.value})}
                  placeholder="Add approval notes..."
                  rows={3}
                />
              </div>
            </div>
          )
        };

      case 'rejectApplication':
        return {
          title: 'Reject Application',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          description: `Reject professional application for ${user.email}`,
          content: (
            <div className="space-y-4">
              <Alert className="border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  This will reject the user's application. Please provide a reason.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={formData.rejectionReason || ''}
                  onChange={(e) => setFormData({...formData, rejectionReason: e.target.value})}
                  placeholder="Please explain why the application is being rejected..."
                  rows={4}
                  required
                />
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Professional Action',
          icon: <FileText className="h-5 w-5" />,
          description: `Perform action: ${action}`,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This professional action is not yet implemented.
                </AlertDescription>
              </Alert>
            </div>
          )
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dialogContent.icon}
            {dialogContent.title}
          </DialogTitle>
          <DialogDescription>
            {dialogContent.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {dialogContent.content}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              variant={action === 'rejectApplication' ? 'destructive' : 'default'}
            >
              {isLoading ? 'Processing...' : 
               action === 'approveApplication' ? 'Approve' :
               action === 'rejectApplication' ? 'Reject' :
               action === 'verifyLicense' ? 'Verify' :
               'Confirm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
