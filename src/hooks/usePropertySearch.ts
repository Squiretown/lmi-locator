
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckLmiStatusResponse } from '@/lib/types';
import { z } from 'zod';
import { checkLmiStatus } from '@/lib/api/lmi';

// Define the form schema for address search
export const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required").max(10)
});

type FormValues = z.infer<typeof formSchema>;

export function usePropertySearch() {
  const [lmiStatus, setLmiStatus] = useState<CheckLmiStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitPropertySearch = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Format the address for the API call
      const formattedAddress = `${values.address}, ${values.city}, ${values.state} ${values.zipCode}`;
      
      // Use the checkLmiStatus function from src/lib/api/lmi.ts
      const result = await checkLmiStatus(formattedAddress);
      
      if (result.status === "error") {
        throw new Error(result.message || "Failed to check property status");
      }
      
      // Since checkLmiStatus returns a different format, we need to transform it
      // to match the CheckLmiStatusResponse type
      const lmiResponse: CheckLmiStatusResponse = {
        is_approved: result.is_approved,
        address: result.address,
        approval_message: result.approval_message,
        tract_id: result.tract_id,
        median_income: result.median_income,
        ami: result.ami,
        income_category: result.income_category,
        percentage_of_ami: result.percentage_of_ami,
        eligibility: result.eligibility || result.status,
        lmi_status: result.lmi_status
      };
      
      setLmiStatus(lmiResponse);
      
      toast.success(`Search completed for ${values.address}`);
      
      return lmiResponse;
    } catch (error) {
      console.error("Error checking property status:", error);
      
      toast.error(error instanceof Error ? error.message : "Failed to check property status. Please try again.");
      
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
