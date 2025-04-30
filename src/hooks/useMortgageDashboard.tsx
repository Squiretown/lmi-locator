
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useMortgageDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleExportResults = (results: any[]) => {
    // Use the toast function from sonner directly
    toast.success("Export successful", {
      description: `${results.length} properties exported to your marketing list.`
    });
  };

  return {
    activeTab,
    setActiveTab,
    signOut,
    handleExportResults
  };
}
