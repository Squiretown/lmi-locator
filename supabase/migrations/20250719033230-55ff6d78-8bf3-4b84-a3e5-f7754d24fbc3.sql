-- Create scheduled_messages table for admin messaging system
CREATE TABLE public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_method TEXT NOT NULL DEFAULT 'in_app',
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('single', 'bulk')),
  recipient_id UUID NULL,
  recipient_filter JSONB NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  error_message TEXT NULL
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage all scheduled messages" 
ON public.scheduled_messages 
FOR ALL 
USING (user_is_admin());

-- Create index for performance
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);