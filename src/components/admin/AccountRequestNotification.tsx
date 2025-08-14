import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserX, AlertTriangle, Check, X, User, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AccountRequestNotificationProps {
  notification: {
    id: string;
    title: string | null;
    message: string;
    notification_type: string | null;
    is_read: boolean | null;
    created_at: string;
    data?: any;
  };
  onUpdate: () => void;
}

export const AccountRequestNotification: React.FC<AccountRequestNotificationProps> = ({
  notification,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAccountCancellation = notification.notification_type === 'account_cancellation';
  const isAccountDeletion = notification.notification_type === 'account_deletion';
  
  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('process-account-request', {
        body: {
          notificationId: notification.id,
          action: 'approve'
        }
      });

      if (error) throw error;

      toast.success(`Account ${isAccountCancellation ? 'cancellation' : 'deletion'} request approved`);
      onUpdate();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('process-account-request', {
        body: {
          notificationId: notification.id,
          action: 'reject',
          adminComments: 'Request rejected by administrator'
        }
      });

      if (error) throw error;

      toast.success(`Account ${isAccountCancellation ? 'cancellation' : 'deletion'} request rejected`);
      onUpdate();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to a detailed view page or open a modal
    navigate(`/admin/account-requests/${notification.id}`);
  };

  const getStatusBadge = () => {
    const status = notification.data?.status;
    if (status === 'approved') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="destructive">Pending Action</Badge>;
  };

  const getIcon = () => {
    if (isAccountDeletion) {
      return <UserX className="h-4 w-4 text-red-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  };

  const isPending = !notification.data?.status || notification.data?.status === 'pending';

  return (
    <div className={`p-3 border-l-2 ${
      !notification.is_read 
        ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
        : 'border-l-transparent'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getIcon()}
            {notification.title && (
              <p className="font-medium text-sm truncate">
                {notification.title}
              </p>
            )}
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            )}
            {getStatusBadge()}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
            
            {isPending && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs"
                  onClick={handleViewDetails}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  onClick={handleReject}
                  disabled={loading}
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};