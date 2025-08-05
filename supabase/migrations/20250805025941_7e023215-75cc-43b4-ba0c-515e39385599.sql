-- Step 3: Create simple RLS policies first

-- RLS policies for realtors
CREATE POLICY "Realtors can view their own profile" ON public.realtors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Realtors can update their own profile" ON public.realtors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Public can view active realtors" ON public.realtors
  FOR SELECT USING (status = 'active');

-- RLS policies for mortgage_professionals  
CREATE POLICY "Mortgage professionals can view their own profile" ON public.mortgage_professionals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Mortgage professionals can update their own profile" ON public.mortgage_professionals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Public can view active mortgage professionals" ON public.mortgage_professionals
  FOR SELECT USING (status = 'active');