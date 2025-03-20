
import { supabase } from "@/integrations/supabase/client";

/**
 * Save a search to the database
 * @param address The address that was searched
 * @param result The result object returned by the API
 */
export const saveSearch = async (address: string, result: any) => {
  try {
    // Get the current user (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'saveSearch',
        params: { address, result, userId }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving search:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get search history
 * @param limit Maximum number of records to return
 */
export const getSearchHistory = async (limit: number = 10) => {
  try {
    // Get the current user (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getSearchHistory',
        params: { userId, limit }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving search history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get cached Census API result for a tract
 * @param tractId Census tract ID
 */
export const getCachedCensusResult = async (tractId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getCachedCensusResult',
        params: { tractId }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving cached Census result:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cache Census API result
 * @param tractId Census tract ID
 * @param data Data to cache
 * @param expiresInDays Number of days until the cache expires
 */
export const cacheCensusResult = async (tractId: string, data: any, expiresInDays: number = 30) => {
  try {
    const { data: responseData, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'cacheCensusResult',
        params: { tractId, data, expiresInDays }
      }
    });

    if (error) throw error;
    return responseData;
  } catch (error) {
    console.error('Error caching Census result:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get popular searches
 * @param limit Maximum number of records to return
 */
export const getPopularSearches = async (limit: number = 5) => {
  try {
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getPopularSearches',
        params: { limit }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving popular searches:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('searched_at', { ascending: false });
    
    if (error) throw error;
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: propertyCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    const { count: realtorCount } = await supabase
      .from('realtors')
      .select('*', { count: 'exact', head: true });
    
    return {
      searchHistory: data,
      userCount,
      propertyCount,
      realtorCount
    };
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return { success: false, error: error.message };
  }
};

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

/**
 * Create a marketing job for address verification
 * @param campaignName Name of the campaign
 * @param addresses Array of addresses to verify
 */
export const createMarketingJob = async (campaignName: string, addresses: string[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    // First create the marketing job
    const { data: jobData, error: jobError } = await supabase
      .from('marketing_jobs')
      .insert({
        user_id: userId,
        campaign_name: campaignName,
        total_addresses: addresses.length,
        status: 'pending'
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Then add all addresses
    const addressObjects = addresses.map(address => ({
      marketing_id: jobData.marketing_id,
      address: address,
      status: 'pending'
    }));

    const { error: addressError } = await supabase
      .from('marketing_addresses')
      .insert(addressObjects);

    if (addressError) throw addressError;

    return jobData;
  } catch (error) {
    console.error('Error creating marketing job:', error);
    return null;
  }
};

/**
 * Get marketing jobs for the current user
 */
export const getUserMarketingJobs = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('marketing_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving marketing jobs:', error);
    return [];
  }
};

/**
 * Add a client for a professional user
 * @param clientData Client data
 */
export const addClient = async (clientData: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        professional_id: userId,
        ...clientData
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding client:', error);
    return null;
  }
};

/**
 * Get clients for the current professional user
 */
export const getProfessionalClients = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('professional_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving clients:', error);
    return [];
  }
};
