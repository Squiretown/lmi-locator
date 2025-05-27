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

  const handleCancel = async () => {
    setError(null);
    
    // Check confirmation text
    if (confirmText !== 'CANCEL') {
      setError('Please type CANCEL to confirm account cancellation');
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

      // Update user profile to mark as cancelled/inactive
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          user_type: 'cancelled',
          // Keep the account but mark it as cancelled
        })
        .eq('user_id', user?.id);

      if (updateError) {
        console.error('Error cancelling account:', updateError);
        setError('Failed to cancel account. Please try again.');
        return;
      }

      toast.success('Account cancelled successfully. You can reactivate it by logging in again.');
      setIsOpen(false);
      
      // Sign out the user
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error('Error cancelling account:', error);
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
        <Button variant="outline">Cancel Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-orange-600">Cancel Account</DialogTitle>
          <DialogDescription>
            This will deactivate your account temporarily. You can reactivate it by logging in again later. Your data will be preserved.
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
            onClick={handleCancel}
            disabled={isLoading || confirmText !== 'CANCEL' || !password}
          >
            {isLoading ? 'Cancelling...' : 'Cancel Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAccountDialog;
