
import React from 'react';
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';

interface FirstTimeBuyerFieldProps {
  control: Control<any>;
  label?: string;
  description?: string;
}

const FirstTimeBuyerField: React.FC<FirstTimeBuyerFieldProps> = ({ 
  control, 
  label = "First-Time Homebuyer", 
  description = "Are you a first-time homebuyer? (Generally defined as not having owned a home in the past 3 years)" 
}) => {
  return (
    <FormField
      control={control}
      name="first_time_buyer"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            <FormDescription>
              {description}
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
};

export default FirstTimeBuyerField;
