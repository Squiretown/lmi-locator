
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PropertySearchForm from './PropertySearchForm';
import { formSchema } from '@/hooks/usePropertySearch';
import * as z from 'zod';

interface PropertySearchCardProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

const PropertySearchCard: React.FC<PropertySearchCardProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Property Checker</CardTitle>
        <CardDescription>Enter an address to check LMI eligibility</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <PropertySearchForm 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
};

export default PropertySearchCard;
