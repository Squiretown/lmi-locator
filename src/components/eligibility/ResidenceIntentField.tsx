
import React from 'react';
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';

interface ResidenceIntentFieldProps {
  control: Control<any>;
  label?: string;
  description?: string;
}

const ResidenceIntentField: React.FC<ResidenceIntentFieldProps> = ({ 
  control, 
  label = "Primary Residence", 
  description = "Do you intend to use this property as your primary residence?" 
}) => {
  return (
    <FormField
      control={control}
      name="residence_intent"
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

export default ResidenceIntentField;
