
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  checkLmiStatus, 
  checkHudLmiStatus, 
  checkHudLmiStatusByPlace,
  checkEnhancedLmiStatus,
  checkDirectLmiStatus
} from '@/lib/api/lmi';
import { LmiResult } from '@/lib/api/lmi/types';

interface UseLmiTestProps {
  address: string;
  setResults: (results: any) => void;
  setLoading: (loading: boolean) => void;
}

export function useLmiTest({
  address,
  setResults,
  setLoading
}: UseLmiTestProps) {
  const [searchType, setSearchType] = useState<'address' | 'place'>('address');
  const [level, setLevel] = useState<'tract' | 'blockGroup'>('tract');
  const [useHudData, setUseHudData] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(false);
  const [useDirect, setUseDirect] = useState(false);
  

  const handleLmiTest = async () => {
    if (!address) {
      toast.error(`Please enter ${searchType === 'place' ? 'a place name' : 'an address'}`);
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      let result: LmiResult;
      
      if (useDirect) {
        // Use direct ArcGIS service implementation
        result = await checkDirectLmiStatus(address);
      } else if (useEnhanced) {
        // Use enhanced implementation
        result = await checkEnhancedLmiStatus(address);
      } else if (useHudData) {
        if (searchType === 'place') {
          result = await checkHudLmiStatusByPlace(address, { level });
        } else {
          result = await checkHudLmiStatus(address, { level });
        }
      } else {
        result = await checkLmiStatus(address, { 
          searchType, 
          level,
          useHud: false
        });
      }
      
      setResults(result);
      toast.success('LMI check completed');
    } catch (error) {
      console.error('LMI check error:', error);
      toast.error('LMI check failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    searchType,
    setSearchType,
    level,
    setLevel,
    useHudData,
    setUseHudData,
    useEnhanced,
    setUseEnhanced,
    useDirect,
    setUseDirect,
    handleLmiTest
  };
}
