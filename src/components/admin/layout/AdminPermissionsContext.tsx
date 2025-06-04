
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTemporaryPermissions } from "@/lib/supabase/temporary-permissions";

interface AdminPermissionsContextType {
  userType: string | null;
  permissions: string[];
  hasPermission: (permissionName: string) => boolean;
  unreadNotifications: number;
}

const AdminPermissionsContext = createContext<AdminPermissionsContextType>({
  userType: null,
  permissions: [],
  hasPermission: () => false,
  unreadNotifications: 0
});

export const useAdminPermissions = () => useContext(AdminPermissionsContext);

export const AdminPermissionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      try {
        // Use the new safe function to get user type
        const { data: userTypeFromDb, error: userTypeError } = await supabase.rpc('get_current_user_type_safe');
        
        if (userTypeError) {
          console.error('Error fetching user type:', userTypeError);
          // Fallback to metadata
          const userMetadataType = session.user?.user_metadata?.user_type;
          setUserType(userMetadataType || 'client');
        } else {
          setUserType(userTypeFromDb || 'client');
        }
        
        // Get unread notification count
        // Note: This is commented out until we have proper notification handling
        // const { data: notificationCount } = await supabase.rpc(
        //   'get_notification_counts',
        //   { user_uuid: session.user.id }
        // );
        
        // Temporary hardcoded notification count
        setUnreadNotifications(3);
        
        // Use our temporary permissions implementation
        const tempUserType = userTypeFromDb || session.user?.user_metadata?.user_type || 'client';
        const userPermissions = getTemporaryPermissions(tempUserType);
        setPermissions(userPermissions);
        
      } catch (error) {
        console.error('Error in user data fetch:', error);
        // Fallback to metadata
        const userMetadataType = session.user?.user_metadata?.user_type;
        setUserType(userMetadataType || 'client');
        const userPermissions = getTemporaryPermissions(userMetadataType || 'client');
        setPermissions(userPermissions);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Helper function to check if user has a specific permission
  const hasPermission = (permissionName: string) => {
    return permissions.includes(permissionName) || userType === 'admin';
  };

  return (
    <AdminPermissionsContext.Provider 
      value={{ 
        userType, 
        permissions, 
        hasPermission, 
        unreadNotifications 
      }}
    >
      {children}
    </AdminPermissionsContext.Provider>
  );
};
