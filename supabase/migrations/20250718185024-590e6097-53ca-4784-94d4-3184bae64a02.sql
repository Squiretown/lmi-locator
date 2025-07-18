
-- Create a simple saved_addresses table to replace the complex properties + saved_properties setup
CREATE TABLE public.saved_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  is_lmi_eligible BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the saved_addresses table
CREATE POLICY "Users can view their own saved addresses" 
ON public.saved_addresses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved addresses" 
ON public.saved_addresses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved addresses" 
ON public.saved_addresses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved addresses" 
ON public.saved_addresses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX saved_addresses_user_id_idx ON public.saved_addresses(user_id);
CREATE INDEX saved_addresses_created_at_idx ON public.saved_addresses(created_at DESC);
