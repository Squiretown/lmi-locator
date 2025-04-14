
import React from 'react';
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';

interface MilitaryStatusFieldProps {
  control: Control<any>;
  label?: string;
  description?: string;
}

const MilitaryStatusField: React.FC<MilitaryStatusFieldProps> = ({ 
  control, 
  label = "Military Status", 
  description = "Please select your current military status." 
}) => {
  return (
    <FormField
      control={control}
      name="military_status"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormDescription>
            {description}
          </FormDescription>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="none" />
                </FormControl>
                <FormLabel className="font-normal">None</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="veteran" />
                </FormControl>
                <FormLabel className="font-normal">Veteran</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="active" />
                </FormControl>
                <FormLabel className="font-normal">Active Duty</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="reserve" />
                </FormControl>
                <FormLabel className="font-normal">Reserve/National Guard</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MilitaryStatusField;
