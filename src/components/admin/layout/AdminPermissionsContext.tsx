
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUserPermissions, getUserTypeName } from "@/lib/supabase/user";

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

      // Get unread notification count using the RPC function
      const { data: notificationCount } = await supabase.rpc(
        'get_notification_counts',
        { user_uuid: session.user.id }
      );
      
      setUnreadNotifications(notificationCount?.[0]?.unread_count || 0);
      
      try {
        // Get user type name using our utility function
        const userTypeName = await getUserTypeName();
        setUserType(userTypeName || 'standard');
        
        // Get user permissions using our utility function
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error in user data fetch:', error);
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
