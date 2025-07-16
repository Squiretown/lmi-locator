import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileMenu } from '@/components/auth/ProfileMenu';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  subtitle,
  actions 
}) => {
  const { user } = useAuth();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {actions}
        <ProfileMenu />
      </div>
    </div>
  );
};