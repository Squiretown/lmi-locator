
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function useMortgageDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleExportResults = (results: any[]) => {
    // Use the toast function that now accepts arguments
    toast.success({
      title: "Export successful",
      description: `${results.length} properties exported to your marketing list.`,
    });
  };

  return {
    activeTab,
    setActiveTab,
    signOut,
    handleExportResults
  };
}
