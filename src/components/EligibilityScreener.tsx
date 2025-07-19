
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import EligibilityForm from './eligibility/EligibilityForm';
import { useProgramEligibilityCheck } from './eligibility/useProgramEligibilityCheck';
import { formatAddress } from './specialist-connect/utils/addressUtils';

interface EligibilityScreenerProps {
  propertyId?: string;
  searchId?: string;
  address: string;
  onComplete: (result: any) => void;
}

const EligibilityScreener: React.FC<EligibilityScreenerProps> = ({ 
  propertyId, 
  searchId, 
  address,
  onComplete 
}) => {
  const { toast } = useToast();
  const { checkEligibility } = useProgramEligibilityCheck();
  
  const cleanAddress = formatAddress(address);
  
  const handleSubmit = async (data: any) => {
    try {
      const result = await checkEligibility(data, propertyId, searchId);
      
      // Call the onComplete callback with results
      onComplete(result);
      
      toast({
        title: "Eligibility Check Complete",
        description: "Your eligibility results are ready."
      });
    } catch (error) {
      console.error('Error during eligibility check:', error);
      toast({
        title: "Error",
        description: "There was an error checking your eligibility. Please try again."
      });
    }
  };

  // Remove motion.div and use regular div instead
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Down Payment Assistance Eligibility</CardTitle>
          <CardDescription>
            Answer a few quick questions to see which assistance programs you might qualify for at {cleanAddress}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EligibilityForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EligibilityScreener;
