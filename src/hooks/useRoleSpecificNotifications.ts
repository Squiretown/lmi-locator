
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

export function useRoleSpecificNotifications() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createLmiNotification = async (address: string, isApproved: boolean) => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const userType = user.user_metadata?.user_type;
      let title = '';
      let message = '';

      switch (userType) {
        case 'mortgage_professional':
          title = `LMI Status: ${address}`;
          message = isApproved ? 
            `Property at ${address} is in an LMI eligible area. Review lending program options.` :
            `Property at ${address} is not in an LMI eligible area. Consider alternative programs.`;
          break;

        case 'realtor':
          title = `Property LMI Check: ${address}`;
          message = isApproved ?
            `${address} is in an LMI eligible area. Share this information with potential buyers.` :
            `${address} is not in an LMI eligible area. Consider alternative properties for LMI buyers.`;
          break;

        default: // client
          title = `Property Update: ${address}`;
          message = isApproved ?
            `Good news! ${address} is in an LMI eligible area. You may qualify for assistance programs.` :
            `${address} is not in an LMI eligible area. Let's explore other options or properties.`;
          break;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          notification_type: 'lmi_check',
          is_read: false
        });

      if (error) throw error;
      
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createLmiNotification,
    isCreating
  };
}
