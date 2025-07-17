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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientProfile } from '@/lib/types/user-models';
import { useClientActions } from '@/hooks/useClientActions';

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientProfile;
  onComplete: () => void;
}

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  open,
  onOpenChange,
  client,
  onComplete,
}) => {
  const [reason, setReason] = useState('');
  const { updateClientStatus, isLoading } = useClientActions();

  const isDeactivated = client.status === 'deactivated';
  const newStatus = isDeactivated ? 'active' : 'deactivated';
  const actionText = isDeactivated ? 'Reactivate' : 'Deactivate';

  const handleSubmit = async () => {
    try {
      await updateClientStatus(client.id, newStatus, reason || undefined);
      onComplete();
      setReason('');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionText} Client
          </DialogTitle>
          <DialogDescription>
            {isDeactivated 
              ? `Are you sure you want to reactivate ${client.first_name} ${client.last_name}?`
              : `Are you sure you want to deactivate ${client.first_name} ${client.last_name}?`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">
              {isDeactivated ? 'Reactivation Reason (Optional)' : 'Deactivation Reason (Optional)'}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isDeactivated 
                ? "Why are you reactivating this client?"
                : "Why are you deactivating this client?"
              }
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant={isDeactivated ? "default" : "destructive"}
          >
            {isLoading ? 'Processing...' : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};