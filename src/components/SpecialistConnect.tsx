
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SpecialistForm from './specialist-connect/SpecialistForm';
import SuccessMessage from './specialist-connect/SuccessMessage';
import { formatAddress } from './specialist-connect/utils/addressUtils';
import type { SpecialistFormValues } from './specialist-connect/SpecialistForm';

interface SpecialistConnectProps {
  address: string;
  propertyId?: string;
  onComplete: () => void;
}

const SpecialistConnect: React.FC<SpecialistConnectProps> = ({ 
  address,
  propertyId,
  onComplete
}) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const cleanAddress = formatAddress(address);
  
  const handleSubmit = async (data: SpecialistFormValues) => {
    try {
      // Get user session if available
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create a new lead in the database
      const { error } = await supabase
        .from('professional_leads')
        .insert({
          professional_id: null, // Will be assigned to an available professional
          client_name: data.name,
          email: data.email,
          phone: data.phone,
          property_address: cleanAddress,
          property_id: propertyId,
          status: 'new',
          source: 'connect_specialist_form',
          notes: data.message
        });
        
      if (error) throw error;
      
      setUserEmail(data.email);
      setIsSubmitted(true);
      
      toast({
        title: "Request Sent",
        description: "A specialist will contact you shortly about down payment assistance options.",
      });
      
      // Wait a bit before completing to let the user see the success message
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error submitting specialist request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return <SuccessMessage email={userEmail} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Connect with a Specialist</CardTitle>
          <CardDescription>
            Get personalized help with down payment assistance programs for {cleanAddress}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SpecialistForm 
            defaultMessage={`I'm interested in learning more about down payment assistance programs for ${cleanAddress}.`}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpecialistConnect;
