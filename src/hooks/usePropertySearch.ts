
import { useState } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { z } from 'zod';
import { checkDirectLmiStatus } from '@/lib/api/lmi';
import { useSimpleNotification } from '@/hooks/useSimpleNotification';

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
  const notification = useSimpleNotification();

  const submitPropertySearch = async (values: FormValues) => {
    setIsLoading(true);
    try {
      console.log('Search Input Values:', {
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode
      });
      
      const formattedAddress = `${values.address}, ${values.city}, ${values.state} ${values.zipCode}`;
      
      console.log('Formatted Address:', formattedAddress);
      
      const result = await checkDirectLmiStatus(formattedAddress);
      
      console.log('Full Result Object:', JSON.stringify(result, null, 2));
      
      if (result.status === "error") {
        // Show error alert without toast
        console.error('Search Error:', result.message || "Failed to check property status");
        throw new Error(result.message || "Failed to check property status");
      }
      
      // Log each property of the result
      console.log('Result Properties:', {
        is_approved: result.is_approved,
        address: result.address,
        tract_id: result.tract_id,
        median_income: result.median_income,
        ami: result.ami,
        income_category: result.income_category,
        percentage_of_ami: result.percentage_of_ami,
        eligibility: result.eligibility,
        lmi_status: result.lmi_status
      });
      
      const lmiResponse: CheckLmiStatusResponse = {
        is_approved: result.is_approved,
        address: result.address || formattedAddress,
        approval_message: result.approval_message || '',
        tract_id: result.tract_id || 'Unknown',
        median_income: result.median_income || 0,
        ami: result.ami || 0,
        income_category: result.income_category || 'Unknown',
        percentage_of_ami: result.percentage_of_ami || 0,
        eligibility: result.eligibility || result.status || 'Unknown',
        lmi_status: result.lmi_status || (result.is_approved ? 'LMI Eligible' : 'Not Eligible'),
        lat: result.lat,
        lon: result.lon
      };
      
      setLmiStatus(lmiResponse);

      // Single, centered notification with enhanced styling
      const notificationContent = `
        ${lmiResponse.address}
        Census Tract: ${lmiResponse.tract_id || 'Unknown'}
        Income Category: ${lmiResponse.income_category || 'Unknown'}
        AMI: ${lmiResponse.percentage_of_ami}%
      `;

      if (lmiResponse.is_approved) {
        notification.success(
          'APPROVED - LMI ELIGIBLE AREA',
          notificationContent
        );
      } else {
        notification.error(
          'NOT APPROVED - NOT IN LMI AREA',
          notificationContent
        );
      }

      return lmiResponse;
    } catch (error) {
      console.error("Error checking property status:", error);
      notification.error(
        'Search Failed',
        error instanceof Error ? error.message : "Unable to check property status"
      );
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

