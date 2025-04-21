
import { useState, useEffect, useCallback } from 'react';
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

  const loadActivities = useCallback(async () => {
    if (!user) {
      loadActivitiesFromLocalStorage();
      return;
    }
    
    setIsLoading(true);
    try {
      // Load search history from Supabase
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_history')
        .select('id, address, searched_at, is_eligible, search_params, result')
        .eq('user_id', user.id)
        .order('searched_at', { ascending: false })
        .limit(20);
        
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
      
      // Also get saved properties
      const { data: savedProperties, error: savedError } = await supabase
        .from('saved_properties')
        .select(`
          id, 
          created_at, 
          is_favorite, 
          properties!inner(address, is_lmi_eligible)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!savedError && savedProperties) {
        const savedActivities: ActivityItem[] = savedProperties.map(item => ({
          id: item.id,
          type: 'save',
          timestamp: item.created_at,
          address: item.properties?.address || 'Unknown address',
          result: (item.properties?.is_lmi_eligible || item.is_favorite) ? 'eligible' : 'not-eligible',
          details: 'Property saved to collection'
        }));
        
        // Combine both types of activities and sort by timestamp
        const combined = [...formattedActivities, ...savedActivities].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setActivities(combined);
      } else {
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error loading client activities:', error);
      // Fall back to local storage if needed
      loadActivitiesFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadActivitiesFromLocalStorage = useCallback(() => {
    const localActivities = localStorage.getItem('clientActivities');
    if (localActivities) {
      try {
        setActivities(JSON.parse(localActivities));
      } catch (error) {
        console.error('Error parsing local activities:', error);
      }
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: crypto.randomUUID()
    };
    
    setActivities(prev => {
      const updatedActivities = [newActivity, ...prev].slice(0, 20); // Keep last 20 activities
      
      // Save to localStorage for non-authenticated users
      if (!user) {
        localStorage.setItem('clientActivities', JSON.stringify(updatedActivities));
      }
      
      return updatedActivities;
    });
    
    return newActivity;
  }, [user]);

  return {
    activities,
    isLoading,
    addActivity,
    refreshActivities: loadActivities
  };
}
