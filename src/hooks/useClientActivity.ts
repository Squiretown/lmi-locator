
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityItem {
  id: string;
  type: 'search' | 'save' | 'program' | 'specialist';
  timestamp: string;
  address?: string;
  result?: 'eligible' | 'not-eligible';
  details?: string;
}

export function useClientActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadActivities();
    } else {
      // For non-authenticated users, we can load from localStorage
      loadActivitiesFromLocalStorage();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load search history from Supabase
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_history')
        .select('id, address, searched_at, is_eligible, search_params, result')
        .eq('user_id', user.id)
        .order('searched_at', { ascending: false })
        .limit(10);
        
      if (searchError) throw searchError;
      
      const formattedActivities: ActivityItem[] = searchHistory.map(item => ({
        id: item.id,
        type: 'search',
        timestamp: item.searched_at,
        address: item.address,
        result: item.is_eligible ? 'eligible' : 'not-eligible',
        details: item.is_eligible 
          ? 'This property is in an LMI eligible area'
          : 'This property is not in an LMI eligible area'
      }));
      
      // You can also load saved properties, program applications, etc. here
      
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading client activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivitiesFromLocalStorage = () => {
    const localActivities = localStorage.getItem('clientActivities');
    if (localActivities) {
      try {
        setActivities(JSON.parse(localActivities));
      } catch (error) {
        console.error('Error parsing local activities:', error);
      }
    }
  };

  const addActivity = (activity: Omit<ActivityItem, 'id'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: crypto.randomUUID()
    };
    
    const updatedActivities = [newActivity, ...activities].slice(0, 20); // Keep last 20 activities
    setActivities(updatedActivities);
    
    // Save to localStorage for non-authenticated users
    if (!user) {
      localStorage.setItem('clientActivities', JSON.stringify(updatedActivities));
    }
    
    return newActivity;
  };

  return {
    activities,
    isLoading,
    addActivity,
    refreshActivities: user ? loadActivities : loadActivitiesFromLocalStorage
  };
}
