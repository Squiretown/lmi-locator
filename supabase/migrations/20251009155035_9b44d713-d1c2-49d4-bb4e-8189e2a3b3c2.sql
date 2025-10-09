-- Create contact_inquiries table
CREATE TABLE public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'find_professional',
  location TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'contact_form',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can insert (public can submit inquiries)
CREATE POLICY "Anyone can submit contact inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view all contact inquiries"
ON public.contact_inquiries
FOR SELECT
TO authenticated
USING (user_is_admin());

-- Only admins can update inquiries
CREATE POLICY "Admins can update contact inquiries"
ON public.contact_inquiries
FOR UPDATE
TO authenticated
USING (user_is_admin());

-- Only admins can delete inquiries
CREATE POLICY "Admins can delete contact inquiries"
ON public.contact_inquiries
FOR DELETE
TO authenticated
USING (user_is_admin());

-- Create index for faster queries
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);