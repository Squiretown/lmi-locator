
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DeleteAccountDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleDeleteRequest = async () => {
    setError(null);
    
    // Check confirmation text
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion request');
      return;
    }
    
    // Check password is provided
    if (!password) {
      setError('Please enter your current password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify password first
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (verifyError) {
        setError('Incorrect password. Please verify your current password and try again.');
        return;
      }

      // Create a deletion request notification for admins
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          notification_type: 'account_deletion_request',
          title: 'Account Deletion Request',
          message: `User ${user?.email} has requested account deletion. Please review and approve.`,
          data: {
            requesting_user_id: user?.id,
            requesting_user_email: user?.email,
            request_type: 'account_deletion'
          }
        });

      if (notificationError) {
        console.error('Error creating deletion request:', notificationError);
        setError('Failed to submit deletion request. Please try again.');
        return;
      }

      // Also create notifications for all admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_type', 'admin');

      if (!adminError && adminUsers && adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(admin => ({
          user_id: admin.user_id,
          notification_type: 'account_deletion_request',
          title: 'Account Deletion Request',
          message: `User ${user?.email} has requested account deletion. Please review and approve.`,
          data: {
            requesting_user_id: user?.id,
            requesting_user_email: user?.email,
            request_type: 'account_deletion'
          }
        }));

        await supabase
          .from('notifications')
          .insert(adminNotifications);
      }

      toast.success('Account deletion request submitted successfully. An admin will review your request.');
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPassword('');
    setConfirmText('');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Request Account Deletion</DialogTitle>
          <DialogDescription>
            This will submit a request to delete your account. An administrator will review your request and permanently delete your account and all associated data.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-bold">DELETE</span> to confirm
            </Label>
            <Input 
              id="confirm-delete" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteRequest}
            disabled={isLoading || confirmText !== 'DELETE' || !password}
          >
            {isLoading ? 'Submitting Request...' : 'Request Account Deletion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
