
import React from 'react';
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';

interface TimeframeFieldProps {
  control: Control<any>;
}

const TimeframeField: React.FC<TimeframeFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="timeframe"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Purchase Timeframe</FormLabel>
          <FormDescription>
            When do you plan to purchase a home?
          </FormDescription>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="0-3" />
                </FormControl>
                <FormLabel className="font-normal">0-3 months</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="3-6" />
                </FormControl>
                <FormLabel className="font-normal">3-6 months</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="6-12" />
                </FormControl>
                <FormLabel className="font-normal">6-12 months</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="12+" />
                </FormControl>
                <FormLabel className="font-normal">12+ months</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimeframeField;
