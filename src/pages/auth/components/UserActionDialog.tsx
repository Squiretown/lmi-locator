import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RoleManagementDialog } from '@/components/admin/RoleManagementDialog';
import type { AdminUser } from '../types/admin-user';

interface UserActionDialogProps {
  user: AdminUser | null;
  action: string | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (data?: any) => void;
}

export const UserActionDialog: React.FC<UserActionDialogProps> = ({
  user,
  action,
  open,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    duration: '24',
    newEmail: '',
    newRole: '',
    message: '',
    password: '',
  });

  const handleSubmit = () => {
    // Validate required fields based on action
    if (action === 'suspend') {
      if (!formData.reason.trim()) {
        toast.error('Suspension reason is required');
        return;
      }
      if (!formData.duration || formData.duration === '') {
        toast.error('Suspension duration is required');
        return;
      }
      console.log('Suspend form data:', { 
        userId: user?.id, 
        reason: formData.reason, 
        duration: formData.duration 
      });
    }
    
    if (action === 'changeEmail' && !formData.newEmail.trim()) {
      toast.error('New email address is required');
      return;
    }
    
    if (action === 'sendEmail' && !formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    onConfirm(formData);
    setFormData({
      reason: '',
      duration: '24',
      newEmail: '',
      newRole: '',
      message: '',
      password: '',
    });
  };

  // For role changes, use the enhanced dialog
  if (action === 'changeRole') {
    return (
      <RoleManagementDialog
        user={user}
        open={open}
        onClose={onClose}
        onConfirm={async (data) => {
          await onConfirm({ newRole: data.newRole, reason: data.reason });
        }}
      />
    );
  }

  const getDialogContent = () => {
    switch (action) {
      case 'suspend':
        return {
          title: 'Suspend User',
          description: `Temporarily suspend ${user?.email}`,
          content: (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for suspension</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for suspension..."
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                    <SelectItem value="720">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ),
        };

      case 'changeEmail':
        return {
          title: 'Change User Email',
          description: `Change email for ${user?.email}`,
          content: (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={formData.newEmail}
                  onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                  placeholder="Enter new email address..."
                />
              </div>
            </div>
          ),
        };

      case 'sendEmail':
        return {
          title: 'Send Email to User',
          description: `Send email to ${user?.email}`,
          content: (
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={5}
                />
              </div>
            </div>
          ),
        };

      case 'resetPassword':
        return {
          title: 'Reset User Password',
          description: `Reset password for ${user?.email}`,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will send a password reset email to the user.
              </p>
            </div>
          ),
        };

      case 'delete':
        return {
          title: 'Delete User Account',
          description: `Permanently delete ${user?.email}`,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-destructive">
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </p>
              <div>
                <Label htmlFor="password">Confirm with your admin password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password to confirm..."
                />
              </div>
            </div>
          ),
        };

      default:
        return {
          title: 'User Action',
          description: 'Perform action on user',
          content: <div>No content available for this action.</div>,
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>
        
        {dialogContent.content}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant={action === 'delete' || action === 'suspend' ? 'destructive' : 'default'}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};