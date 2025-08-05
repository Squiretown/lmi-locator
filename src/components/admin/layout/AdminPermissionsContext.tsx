
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePermissionsSystem } from "@/hooks/usePermissionsSystem";

interface AdminPermissionsContextType {
  userType: string | null;
  permissions: string[];
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  unreadNotifications: number;
  isLoading: boolean;
  refetch: () => void;
}

const AdminPermissionsContext = createContext<AdminPermissionsContextType>({
  userType: null,
  permissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  unreadNotifications: 0,
  isLoading: true,
  refetch: () => {}
});

export const useAdminPermissions = () => useContext(AdminPermissionsContext);

export const AdminPermissionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  
  // Use the new permissions system
  const {
    permissions,
    userRole,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch
  } = usePermissionsSystem();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Get unread notification count
      // Note: This is commented out until we have proper notification handling
      // const { data: notificationCount } = await supabase.rpc(
      //   'get_notification_counts',
      //   { user_uuid: session.user.id }
      // );
      
      // Temporary hardcoded notification count
      setUnreadNotifications(3);
    };

    checkAuth();
  }, [navigate]);

  return (
    <AdminPermissionsContext.Provider 
      value={{ 
        userType: userRole, 
        permissions, 
        hasPermission, 
        hasAnyPermission,
        hasAllPermissions,
        unreadNotifications,
        isLoading,
        refetch
      }}
    >
      {children}
    </AdminPermissionsContext.Provider>
  );
};
