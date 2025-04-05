
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import EligibilityForm from './eligibility/EligibilityForm';
import { useProgramEligibilityCheck } from './eligibility/useProgramEligibilityCheck';

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
      
      // Since toast is now an empty function, we don't need to pass arguments
      toast();
    } catch (error) {
      console.error('Error during eligibility check:', error);
      // Since toast is now an empty function, we don't need to pass arguments
      toast();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-8"
    >
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
    </motion.div>
  );
};

export default EligibilityScreener;
