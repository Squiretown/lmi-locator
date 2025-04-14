
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import FirstTimeBuyerField from './FirstTimeBuyerField';
import MilitaryStatusField from './MilitaryStatusField';
import ResidenceIntentField from './ResidenceIntentField';
import TimeframeField from './TimeframeField';

// Default question texts
const DEFAULT_QUESTIONS = {
  first_time_buyer_label: "First-Time Homebuyer",
  first_time_buyer_description: "Are you a first-time homebuyer? (Generally defined as not having owned a home in the past 3 years)",
  military_status_label: "Military Status",
  military_status_description: "Please select your current military status.",
  residence_intent_label: "Primary Residence",
  residence_intent_description: "Do you intend to use this property as your primary residence?",
  timeframe_label: "Purchase Timeframe",
  timeframe_description: "When do you plan to purchase a home?",
  is_active: true,
};

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
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_time_buyer: false,
      military_status: 'none',
      residence_intent: true,
      timeframe: '3-6',
    },
  });

  // Fetch custom question text from system settings
  useEffect(() => {
    const fetchQuestionSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'eligibility_questions')
          .single();

        if (error) {
          console.error("Error fetching eligibility questions:", error);
          return;
        }

        if (data && data.value) {
          const parsedQuestions = JSON.parse(data.value);
          setQuestions(parsedQuestions);
        }
      } catch (error) {
        console.error("Error processing eligibility questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSettings();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading questions...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FirstTimeBuyerField 
          control={form.control} 
          label={questions.first_time_buyer_label}
          description={questions.first_time_buyer_description}
        />
        <MilitaryStatusField 
          control={form.control} 
          label={questions.military_status_label}
          description={questions.military_status_description}
        />
        <ResidenceIntentField 
          control={form.control} 
          label={questions.residence_intent_label}
          description={questions.residence_intent_description}
        />
        <TimeframeField 
          control={form.control} 
          label={questions.timeframe_label}
          description={questions.timeframe_description}
        />
        
        <CardFooter className="flex justify-end px-0 pt-4">
          <Button type="submit">Find Assistance Programs</Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default EligibilityForm;
