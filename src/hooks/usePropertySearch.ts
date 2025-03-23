
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckLmiStatusResponse } from '@/lib/types';
import { geocodeAddress } from '@/lib/api/geocode';
import { getMedianIncome } from '@/lib/api/income';
import { saveSearch } from '@/lib/supabase-api';

export const formSchema = z.object({
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
});

export type PropertySearchFormData = z.infer<typeof formSchema>;

export function usePropertySearch() {
  const [lmiStatus, setLmiStatus] = useState<CheckLmiStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitPropertySearch(values: PropertySearchFormData) {
    setIsLoading(true);
    setLmiStatus(null);
    try {
      // Get coordinates and census tract ID from the address
      const { geoid } = await geocodeAddress(values.address);
      const medianIncome = await getMedianIncome(geoid || '');
      
      // Determine LMI eligibility
      const areaMedianIncome = 80000; // Default AMI value
      const percentOfAmi = Math.round((medianIncome / areaMedianIncome) * 100);
      const isLmiEligible = percentOfAmi <= 80;
      
      const result: CheckLmiStatusResponse = {
        address: values.address,
        tract_id: geoid || 'Unknown',
        median_income: medianIncome,
        ami: areaMedianIncome,
        income_category: isLmiEligible ? 'Low-to-Moderate Income' : 'Above Moderate Income',
        percentage_of_ami: percentOfAmi,
        eligibility: isLmiEligible ? 'Eligible' : 'Not Eligible',
        approval_message: isLmiEligible 
          ? 'This property is in an LMI census tract and may be eligible for special programs.'
          : 'This property is not in an LMI census tract.',
        is_approved: isLmiEligible,
        lmi_status: isLmiEligible ? 'LMI Eligible' : 'Not LMI Eligible'
      };
      
      // Save the search to Supabase
      try {
        await saveSearch(values.address, result);
      } catch (error) {
        console.error("Error saving search:", error);
      }
      
      setLmiStatus(result);
      return result;
    } catch (error: any) {
      console.error("Failed to check LMI status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to check LMI status",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    lmiStatus,
    isLoading,
    submitPropertySearch,
  };
}
