
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Shield, UserX, Download } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleBulkAction = () => {
    if (!bulkAction) {
      toast.error('Please select an action');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    onBulkAction(bulkAction, selectedUsers);
    setBulkAction('');
  };

  const handleExportUsers = () => {
    toast.info('Export functionality will be implemented');
  };

  const handleImportUsers = () => {
    toast.info('Import functionality will be implemented');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <span className="text-sm text-muted-foreground">
          {selectedUsers.length} of {totalUsers} users selected
        </span>
        
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
            
            <Button onClick={handleBulkAction} size="sm">
              Apply
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
          Export All
        </Button>
      </div>
    </div>
  );
};
