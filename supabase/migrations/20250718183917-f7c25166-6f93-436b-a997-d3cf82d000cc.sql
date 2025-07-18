
-- Add RLS policies for the properties table to allow authenticated users to manage property records

-- Allow authenticated users to insert property records
CREATE POLICY "Authenticated users can insert properties" 
ON public.properties 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update property records (needed for LMI status updates)
CREATE POLICY "Authenticated users can update properties" 
ON public.properties 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view all properties
CREATE POLICY "Authenticated users can view properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to delete property records if needed
CREATE POLICY "Authenticated users can delete properties" 
ON public.properties 
FOR DELETE 
TO authenticated
USING (true);
