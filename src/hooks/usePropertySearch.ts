
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckLmiStatusResponse } from '@/lib/types';
import { z } from 'zod';

// Define the form schema for address search
export const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required").max(10)
});

type FormValues = z.infer<typeof formSchema>;

// Mock API call - replace with actual implementation
const checkLmiStatus = async (values: FormValues): Promise<CheckLmiStatusResponse | null> => {
  // This would be replaced by an actual API call
  console.log("Checking LMI status for:", values);
  
  // Mock a successful response
  return {
    is_approved: Math.random() > 0.5,
    address: `${values.address}, ${values.city}, ${values.state} ${values.zipCode}`,
    approval_message: "Property is in an LMI census tract",
    tract_id: "42003020100",
    median_income: 45000,
    ami: 80000,
    income_category: "low",
    percentage_of_ami: 56.25,
    eligibility: "eligible",
    lmi_status: "qualified"
  };
};

export function usePropertySearch() {
  const [lmiStatus, setLmiStatus] = useState<CheckLmiStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitPropertySearch = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await checkLmiStatus(values);
      setLmiStatus(result);
      
      toast({
        description: `Search completed for ${values.address}`,
      });
      
      return result;
    } catch (error) {
      console.error("Error checking property status:", error);
      
      toast({
        description: "Failed to check property status. Please try again.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lmiStatus,
    isLoading,
    submitPropertySearch
  };
}
