
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckLmiStatusResponse } from '@/lib/types';
import { z } from 'zod';
import { checkDirectLmiStatus } from '@/lib/api/lmi';

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
      
      // Show toast to indicate search is in progress
      toast.info(`Checking status for ${values.address}...`);
      
      // Use the direct ArcGIS service which is working correctly
      const result = await checkDirectLmiStatus(formattedAddress);
      
      if (result.status === "error") {
        throw new Error(result.message || "Failed to check property status");
      }
      
      // Transform the result to match the CheckLmiStatusResponse type
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
      
      // Show appropriate toast based on result
      if (result.is_approved) {
        toast.success(`This property is LMI eligible`);
      } else {
        toast.info(`This property is not in an LMI area`);
      }
      
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
