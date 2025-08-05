import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkRoleChangeData {
  newRole: string;
  reason: string;
}

interface BulkRoleChangeDialogProps {
  selectedUserIds: string[];
  users: any[];
  open: boolean;
  onClose: () => void;
  onConfirm: (data: BulkRoleChangeData) => Promise<void>;
}

export const BulkRoleChangeDialog: React.FC<BulkRoleChangeDialogProps> = ({
  selectedUserIds,
  users,
  open,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState<BulkRoleChangeData>({
    newRole: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
  
  const roleDistribution = selectedUsers.reduce((acc, user) => {
    const role = user.user_metadata?.user_type || 'client';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'client':
        return 'Basic user with access to property searches and saved listings';
      case 'realtor':
        return 'Real estate professional with client management and listing tools';
      case 'mortgage_professional':
        return 'Mortgage professional with loan and client management capabilities';
      case 'admin':
        return 'Full system access with user and data management permissions';
      default:
        return 'Unknown role';
    }
  };

  const getImpactWarnings = () => {
    const warnings = [];
    
    const professionalCount = selectedUsers.filter(user => 
      ['realtor', 'mortgage_professional'].includes(user.user_metadata?.user_type)
    ).length;
    
    const adminCount = selectedUsers.filter(user => 
      user.user_metadata?.user_type === 'admin'
    ).length;

    if (professionalCount > 0 && !['realtor', 'mortgage_professional'].includes(formData.newRole)) {
      warnings.push(`${professionalCount} professional users will have their professional profiles archived`);
    }

    if (adminCount > 0 && formData.newRole !== 'admin') {
      warnings.push(`${adminCount} admin users will lose administrative privileges`);
    }

    if (!['realtor', 'mortgage_professional'].includes(selectedUsers[0]?.user_metadata?.user_type) && 
        ['realtor', 'mortgage_professional'].includes(formData.newRole)) {
      warnings.push(`New professional profiles will be created for ${selectedUsers.length} users`);
    }

    return warnings;
  };

  const handleSubmit = async () => {
    if (!formData.newRole || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(formData);
      
      // Log bulk role changes
      const roleChanges = selectedUsers.map(user => ({
        user_id: user.id,
        old_role: user.user_metadata?.user_type || 'client',
        new_role: formData.newRole,
        reason: formData.reason,
        changed_by: null, // Will be set by the database function
        changed_at: new Date().toISOString(),
        is_bulk_change: true,
      }));
      
      await supabase.from('user_role_changes').insert(roleChanges);
      
      setFormData({ newRole: '', reason: '' });
      onClose();
    } catch (error) {
      console.error('Bulk role change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const warnings = getImpactWarnings();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Role Change
          </DialogTitle>
          <DialogDescription>
            Change roles for {selectedUserIds.length} selected users
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Selected Users Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Current Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roleDistribution).map(([role, count]) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role.replace('_', ' ')}: {count.toString()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Role Selection */}
          <div className="space-y-3">
            <Label htmlFor="newRole">New Role for All Selected Users *</Label>
            <Select 
              value={formData.newRole} 
              onValueChange={(value) => setFormData({ ...formData, newRole: value })}
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
            
            {formData.newRole && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-3">
                  <p className="text-sm text-blue-800">
                    <strong>Target Role:</strong> {getRoleDescription(formData.newRole)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Impact Warnings */}
          {warnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  Expected Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason">Reason for Bulk Change *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why this bulk role change is necessary..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.newRole || !formData.reason.trim()}
            variant="default"
          >
            {isLoading ? 'Changing Roles...' : `Change ${selectedUserIds.length} User Roles`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};