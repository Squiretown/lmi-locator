
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Shield, UserX, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface UserBulkActionsProps {
  selectedUsers: string[];
  onBulkAction: (action: string, userIds: string[], data?: any) => void;
  totalUsers: number;
}

export const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  selectedUsers,
  onBulkAction,
  totalUsers,
}) => {
  const [bulkAction, setBulkAction] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionData, setActionData] = useState<any>({});

  const handleBulkAction = () => {
    if (!bulkAction) {
      toast.error('Please select an action');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    // Actions that need additional data
    const actionsNeedingData = ['changeRole', 'sendEmail'];
    
    if (actionsNeedingData.includes(bulkAction)) {
      setDialogOpen(true);
      return;
    }

    // Execute action directly for simple actions
    onBulkAction(bulkAction, selectedUsers);
    setBulkAction('');
  };

  const handleActionWithData = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    onBulkAction(bulkAction, selectedUsers, actionData);
    setDialogOpen(false);
    setBulkAction('');
    setActionData({});
  };

  const handleExportUsers = () => {
    if (selectedUsers.length === 0) {
      toast.info('Export all users functionality will be implemented');
    } else {
      onBulkAction('export', selectedUsers);
    }
  };

  const handleImportUsers = () => {
    toast.info('Import functionality will be implemented');
  };

  const getActionTitle = () => {
    switch (bulkAction) {
      case 'changeRole':
        return 'Change User Roles';
      case 'sendEmail':
        return 'Send Email to Users';
      default:
        return 'Bulk Action';
    }
  };

  const renderActionForm = () => {
    switch (bulkAction) {
      case 'changeRole':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRole">New Role</Label>
              <Select 
                value={actionData.newRole || ''} 
                onValueChange={(value) => setActionData({ ...actionData, newRole: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="realtor">Realtor</SelectItem>
                  <SelectItem value="mortgage_professional">Mortgage Professional</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'sendEmail':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject"
                value={actionData.subject || ''} 
                onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message"
                value={actionData.message || ''} 
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                placeholder="Email message"
                rows={4}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} of {totalUsers} users selected
            </span>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 items-center">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="deactivate">Deactivate Users</SelectItem>
                  <SelectItem value="sendEmail">Send Email</SelectItem>
                  <SelectItem value="changeRole">Change Role</SelectItem>
                  <SelectItem value="resetPassword">Reset Passwords</SelectItem>
                  <SelectItem value="export">Export Selected</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleBulkAction} size="sm" variant="default">
                Apply Action
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleImportUsers} variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Import Users
          </Button>
          
          <Button onClick={handleExportUsers} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export{selectedUsers.length > 0 ? ' Selected' : ' All'}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              This action will be applied to {selectedUsers.length} selected user(s).
            </DialogDescription>
          </DialogHeader>
          
          {renderActionForm()}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActionWithData}>
              Apply Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
