
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { checkLmiStatus, checkHudLmiStatus } from '@/lib/api/lmi';
import { Switch } from '@/components/ui/switch';

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

  const handleLmiTest = async () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      // Use the appropriate function based on the selected data source
      const result = useHudData 
        ? await checkHudLmiStatus(address)
        : await checkLmiStatus(address);
        
      setResults(result);
      toast.success('LMI check completed');
    } catch (error) {
      console.error('LMI check error:', error);
      toast.error('LMI check failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test LMI Status Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="lmi-address">Address</Label>
          <Input
            id="lmi-address"
            placeholder="Enter an address to check LMI status"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="use-hud" 
            checked={useHudData} 
            onCheckedChange={setUseHudData} 
          />
          <Label htmlFor="use-hud">
            Use HUD LMI data ({useHudData ? 'Enabled' : 'Disabled'})
          </Label>
        </div>

        <div className="text-xs text-muted-foreground">
          {useHudData 
            ? "Using HUD's Low-to-Moderate Income Summary Data (LMISD)" 
            : "Using Census American Community Survey (ACS) data"}
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
