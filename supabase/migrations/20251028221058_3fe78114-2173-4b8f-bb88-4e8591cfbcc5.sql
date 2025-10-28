-- Phase 1: Clean up admin professional records and suspension status

-- Step 1: Unsuspend the admin@example.com account
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'suspended' - 'suspension_end'
WHERE email = 'admin@example.com';

-- Step 2: Remove professional records for admin users
DELETE FROM professionals 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'user_type' = 'admin'
);

-- Step 3: Clean up any professional team relationships for these admins
DELETE FROM professional_teams 
WHERE mortgage_professional_id IN (
  SELECT id FROM professionals 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'user_type' = 'admin'
  )
)
OR realtor_id IN (
  SELECT id FROM professionals 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'user_type' = 'admin'
  )
);

-- Phase 3: Create view to automatically exclude admins from professional queries
CREATE OR REPLACE VIEW active_professionals_view AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.company,
  p.professional_type,
  p.email,
  p.license_number,
  p.phone,
  p.address,
  p.website,
  p.bio,
  p.photo_url,
  p.status,
  p.social_media,
  p.is_verified,
  p.is_flagged,
  p.notes,
  p.visibility_settings,
  p.access_code,
  p.brand_color,
  p.logo_url,
  p.welcome_message,
  p.created_at,
  p.last_updated
FROM professionals p
INNER JOIN auth.users u ON u.id = p.user_id
WHERE p.status = 'active'
  AND COALESCE(u.raw_user_meta_data->>'user_type', '') != 'admin';

-- Grant access to authenticated users
GRANT SELECT ON active_professionals_view TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW active_professionals_view IS 'Active professionals excluding admin users - safe for use in assignment dropdowns and public listings';