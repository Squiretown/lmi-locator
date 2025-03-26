
import { useState } from 'react';
import { checkLmiStatus } from '@/lib/api/lmi';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export function useLmiTest() {
  const [loading, setLoading] = useState(false);
  const [useHud, setUseHud] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(false);
  const [useDirect, setUseDirect] = useState(true);
  const [useMock, setUseMock] = useState(false);

  const checkLmi = async (
    address: string,
    setResults: (data: any) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (!address || address.trim() === '') {
      toast.error('Please enter an address to check');
      return;
    }

    setLoading(true);

    try {
      console.log('Using options:', { useHud, useEnhanced, useDirect, useMock });
      
      const result = await checkLmiStatus(address, {
        useHud,
        useEnhanced,
        useDirect,
        useMock,
      });
      
      setResults(result);
      
      // Show the status toast notification
      if (result.is_approved) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>This property is LMI eligible</span>
          </div>,
          {
            duration: 4000
          }
        );
      } else {
        toast.info(
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>This property is not LMI eligible</span>
          </div>,
          {
            duration: 4000
          }
        );
      }
    } catch (error) {
      console.error('Error checking LMI status:', error);
      setResults({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          <span>Error checking LMI status</span>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    useHud,
    setUseHud,
    useEnhanced,
    setUseEnhanced,
    useDirect,
    setUseDirect,
    useMock,
    setUseMock,
    checkLmi,
  };
}
