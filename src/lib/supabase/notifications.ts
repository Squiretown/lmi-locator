
import { supabase } from "@/integrations/supabase/client";

/**
 * Get notification data for a user
 * @param userId User ID
 */
export const getUserNotifications = async (userId?: string) => {
  try {
    // If no userId is provided, use the current user
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }

    if (!userId) {
      throw new Error('No user ID provided and no user is logged in');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving user notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 * @param notificationId Notification ID
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

/**
 * Get user notification preferences
 */
export const getUserNotificationPreferences = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving notification preferences:', error);
    return [];
  }
};

/**
 * Update user notification preferences
 * @param preferenceId Preference ID
 * @param updates Updates to apply
 */
export const updateNotificationPreference = async (preferenceId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('preference_id', preferenceId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return null;
  }
};
