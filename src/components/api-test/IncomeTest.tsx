
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getMedianIncome } from '@/lib/api/income';

interface IncomeTestProps {
  tractId: string;
  setTractId: (tractId: string) => void;
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const IncomeTest = ({
  tractId,
  setTractId,
  setResults,
  loading,
  setLoading
}: IncomeTestProps) => {
  const handleIncomeTest = async () => {
    if (!tractId) {
      toast.error('Please enter a census tract ID');
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const result = await getMedianIncome(tractId);
      setResults({ medianIncome: result, tractId });
      toast.success('Income data retrieved successfully');
    } catch (error) {
      console.error('Income retrieval error:', error);
      toast.error('Income data retrieval failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Income Data API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tract-id">Census Tract ID</Label>
          <Input
            id="tract-id"
            placeholder="Enter a census tract ID (e.g., 06075010800)"
            value={tractId}
            onChange={(e) => setTractId(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleIncomeTest} 
          disabled={loading || !tractId}
        >
          {loading ? 'Processing...' : 'Test Income Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IncomeTest;
