
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import EligibilityForm from './eligibility/EligibilityForm';
import { useProgramEligibilityCheck } from './eligibility/useProgramEligibilityCheck';
// Remove framer-motion import

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
  
  const handleSubmit = async (data: any) => {
    try {
      const result = await checkEligibility(data, propertyId, searchId);
      
      // Call the onComplete callback with results
      onComplete(result);
      
      // Call toast without arguments since it's now an empty function
      toast();
    } catch (error) {
      console.error('Error during eligibility check:', error);
      // Call toast without arguments since it's now an empty function
      toast();
    }
  };

  // Remove motion.div and use regular div instead
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Down Payment Assistance Eligibility</CardTitle>
          <CardDescription>
            Answer a few quick questions to see which assistance programs you might qualify for at {address}.
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
