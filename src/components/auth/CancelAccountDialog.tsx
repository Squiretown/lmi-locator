
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

const CancelAccountDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCancelRequest = async () => {
    setError(null);
    
    // Check confirmation text
    if (confirmText !== 'CANCEL') {
      setError('Please type CANCEL to confirm account cancellation request');
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

      // Get all admin users first
      const { data: adminUsers, error: adminError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_type', 'admin');

      if (adminError) {
        console.error('Error fetching admin users:', adminError);
        setError(`Failed to fetch administrators: ${adminError.message}`);
        return;
      }

      console.log('Found admin users:', adminUsers);

      if (!adminUsers || adminUsers.length === 0) {
        setError('No administrators found in the system. Please contact support directly.');
        return;
      }

      // Create notifications for all admin users with correct user_id
      const adminNotifications = adminUsers.map(admin => ({
        user_id: admin.user_id, // This should be the admin's user_id, not the requesting user's id
        notification_type: 'account_cancellation_request',
        title: 'Account Cancellation Request',
        message: `User ${user?.email} has requested account cancellation. Please review and approve.`,
        data: {
          requesting_user_id: user?.id,
          requesting_user_email: user?.email,
          request_type: 'account_cancellation'
        }
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(adminNotifications);

      if (notificationError) {
        console.error('Error creating cancellation request:', notificationError);
        setError('Failed to submit cancellation request. Please try again.');
        return;
      }

      toast.success('Account cancellation request submitted successfully. An admin will review your request.');
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error submitting cancellation request:', error);
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
        <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
          Request Account Cancellation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-orange-600">Request Account Cancellation</DialogTitle>
          <DialogDescription>
            This will submit a request to cancel your account. An administrator will review your request and process the cancellation if approved.
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
            <Label htmlFor="confirm-cancel">
              Type <span className="font-bold">CANCEL</span> to confirm
            </Label>
            <Input 
              id="confirm-cancel" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Keep Account
          </Button>
          <Button 
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={handleCancelRequest}
            disabled={isLoading || confirmText !== 'CANCEL' || !password}
          >
            {isLoading ? 'Submitting Request...' : 'Submit Cancellation Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAccountDialog;
