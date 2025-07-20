
-- Ensure all mortgage professionals have records in the professionals table
INSERT INTO public.professionals (
  user_id,
  name,
  email,
  company,
  type,
  status,
  visibility_settings
)
SELECT 
  up.user_id,
  COALESCE(up.full_name, up.email, 'Professional'),
  up.email,
  COALESCE(up.company, 'Independent'),
  'mortgage_professional',
  'active',
  '{"visible_to_clients": true, "showcase_role": null, "showcase_description": null}'::jsonb
FROM public.user_profiles up
WHERE up.user_type = 'mortgage_professional'
  AND up.user_id NOT IN (
    SELECT user_id 
    FROM public.professionals 
    WHERE user_id IS NOT NULL
  );

-- Update existing professionals to have proper visibility settings if they don't
UPDATE public.professionals 
SET visibility_settings = '{"visible_to_clients": true, "showcase_role": null, "showcase_description": null}'::jsonb
WHERE visibility_settings IS NULL 
  OR visibility_settings = '{}'::jsonb
  OR NOT (visibility_settings ? 'visible_to_clients');
