-- Insert missing professional records for users who have user_type but no professional record
-- This will fix the 406 errors and freezing issues

INSERT INTO professionals (
  user_id,
  type,
  name,
  company,
  license_number,
  phone,
  status,
  is_verified,
  is_flagged
)
SELECT 
  up.user_id,
  CASE 
    WHEN up.user_type = 'mortgage_professional' THEN 'mortgage_broker'
    WHEN up.user_type = 'realtor' THEN 'realtor'
    ELSE 'realtor' -- default fallback
  END,
  COALESCE(up.company_name, 'Professional'), -- Use company_name or default
  COALESCE(up.company, up.company_name, 'Company'), -- Use company or company_name or default
  COALESCE(up.license_number, 'TBD'), -- Use existing license or placeholder
  up.phone,
  'active',
  COALESCE(up.license_verified, false),
  false
FROM user_profiles up
LEFT JOIN professionals p ON up.user_id = p.user_id
WHERE up.user_type IN ('mortgage_professional', 'realtor')
  AND p.user_id IS NULL; -- Only insert where no professional record exists

-- Create or update the send-professional-invitation edge function
-- (This will be handled separately)

-- Update the edge function permissions and ensure proper API handling
-- (This will be addressed in the next step)