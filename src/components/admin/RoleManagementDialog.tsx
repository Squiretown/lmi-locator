import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { AdminUser } from '@/pages/auth/types/admin-user';

interface RoleChangeData {
  newRole: string;
  reason: string;
  effectiveDate?: string;
}

interface RoleManagementDialogProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: RoleChangeData) => Promise<void>;
}

export const RoleManagementDialog: React.FC<RoleManagementDialogProps> = ({
  user,
  open,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState<RoleChangeData>({
    newRole: '',
    reason: '',
    effectiveDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentRole = user?.user_metadata?.user_type || 'client';

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

  const getRoleImpact = (fromRole: string, toRole: string) => {
    const impacts = [];
    
    // Professional role changes
    if ((fromRole === 'realtor' || fromRole === 'mortgage_professional') && 
        (toRole === 'client' || toRole === 'admin')) {
      impacts.push('Professional profile and client data will be archived');
    }
    
    if ((fromRole === 'client' || fromRole === 'admin') && 
        (toRole === 'realtor' || toRole === 'mortgage_professional')) {
      impacts.push('New professional profile will be created');
    }
    
    // Admin role changes
    if (fromRole === 'admin' && toRole !== 'admin') {
      impacts.push('Administrative permissions will be revoked');
    }
    
    if (fromRole !== 'admin' && toRole === 'admin') {
      impacts.push('Full administrative permissions will be granted');
    }
    
    return impacts;
  };

  const handleSubmit = async () => {
    if (!formData.newRole || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(formData);
      
      // Log the role change
      await supabase.from('user_role_changes').insert({
        user_id: user?.id,
        old_role: currentRole,
        new_role: formData.newRole,
        reason: formData.reason,
        changed_by: (await supabase.auth.getUser()).data.user?.id,
        changed_at: new Date().toISOString(),
      });
      
      setFormData({ newRole: '', reason: '', effectiveDate: '' });
      onClose();
    } catch (error) {
      console.error('Role change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const impacts = formData.newRole ? getRoleImpact(currentRole, formData.newRole) : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Modify user permissions and access level for {user?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Role Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Current Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {currentRole.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(currentRole)}
              </p>
            </CardContent>
          </Card>

          {/* New Role Selection */}
          <div className="space-y-3">
            <Label htmlFor="newRole">New Role *</Label>
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
                    <strong>New Role:</strong> {getRoleDescription(formData.newRole)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Impact Warning */}
          {impacts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  Expected Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {impacts.map((impact, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                      {impact}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason">Reason for Change *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why this role change is necessary..."
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
          >
            {isLoading ? 'Changing Role...' : 'Change Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};