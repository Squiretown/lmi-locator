
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  checkLmiStatus, 
  checkHudLmiStatus, 
  checkHudLmiStatusByPlace,
  checkEnhancedLmiStatus
} from '@/lib/api/lmi';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface LmiTestProps {
  address: string;
  setAddress: (address: string) => void;
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LmiTest = ({
  address,
  setAddress,
  setResults,
  loading,
  setLoading
}: LmiTestProps) => {
  const [useHudData, setUseHudData] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(false);
  const [searchType, setSearchType] = useState<'address' | 'place'>('address');
  const [level, setLevel] = useState<'tract' | 'blockGroup'>('tract');

  const handleLmiTest = async () => {
    if (!address) {
      toast.error(`Please enter ${searchType === 'place' ? 'a place name' : 'an address'}`);
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      let result;
      
      if (useEnhanced) {
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
  
  const placeholderText = searchType === 'place' 
    ? 'Enter a place name (e.g., Boston, MA)' 
    : 'Enter an address to check LMI status';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test LMI Status Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-type">Search Type</Label>
          <Select 
            value={searchType} 
            onValueChange={(value: 'address' | 'place') => setSearchType(value)}
            disabled={useEnhanced}
          >
            <SelectTrigger id="search-type">
              <SelectValue placeholder="Select search type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="address">Search by Address</SelectItem>
              <SelectItem value="place">Search by Place Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="geography-level">Geography Level</Label>
          <Select 
            value={level} 
            onValueChange={(value: 'tract' | 'blockGroup') => setLevel(value)}
            disabled={useEnhanced}
          >
            <SelectTrigger id="geography-level">
              <SelectValue placeholder="Select geography level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tract">Census Tract</SelectItem>
              <SelectItem value="blockGroup">Block Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="lmi-query">
            {searchType === 'place' ? 'Place Name' : 'Address'}
          </Label>
          <Input
            id="lmi-query"
            placeholder={placeholderText}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="use-hud" 
            checked={useHudData} 
            onCheckedChange={(checked) => {
              setUseHudData(checked);
              if (checked) setUseEnhanced(false);
            }} 
            disabled={useEnhanced}
          />
          <Label htmlFor="use-hud">
            Use HUD LMI data ({useHudData ? 'Enabled' : 'Disabled'})
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="use-enhanced" 
            checked={useEnhanced} 
            onCheckedChange={(checked) => {
              setUseEnhanced(checked);
              if (checked) setUseHudData(false);
            }}
          />
          <Label htmlFor="use-enhanced">
            Use Enhanced Implementation ({useEnhanced ? 'Enabled' : 'Disabled'})
          </Label>
        </div>

        <div className="text-xs text-muted-foreground">
          {useEnhanced 
            ? "Using enhanced client-side implementation with direct API calls"
            : (useHudData 
              ? "Using HUD's Low-to-Moderate Income Summary Data (LMISD)" 
              : "Using Census American Community Survey (ACS) data")}
        </div>
        
        <Button 
          onClick={handleLmiTest} 
          disabled={loading || !address}
        >
          {loading ? 'Processing...' : 'Test LMI Status'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LmiTest;
