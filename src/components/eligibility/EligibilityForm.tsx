
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import FirstTimeBuyerField from './FirstTimeBuyerField';
import MilitaryStatusField from './MilitaryStatusField';
import ResidenceIntentField from './ResidenceIntentField';
import TimeframeField from './TimeframeField';

// Form schema validation with zod
const formSchema = z.object({
  first_time_buyer: z.boolean().default(false),
  military_status: z.enum(['none', 'veteran', 'active', 'reserve']).default('none'),
  residence_intent: z.boolean().default(true),
  timeframe: z.enum(['0-3', '3-6', '6-12', '12+']).default('3-6'),
});

interface EligibilityFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const EligibilityForm: React.FC<EligibilityFormProps> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_time_buyer: false,
      military_status: 'none',
      residence_intent: true,
      timeframe: '3-6',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FirstTimeBuyerField control={form.control} />
        <MilitaryStatusField control={form.control} />
        <ResidenceIntentField control={form.control} />
        <TimeframeField control={form.control} />
        
        <CardFooter className="flex justify-end px-0 pt-4">
          <Button type="submit">Find Assistance Programs</Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default EligibilityForm;
