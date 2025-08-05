-- Complete the cleanup - the main constraint fixes were successful
-- The blocking records have been deleted and CASCADE constraints are now in place

-- Verify the fixes worked by checking current state
SELECT 
    tc.table_name,
    tc.constraint_name, 
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.constraint_name IN (
    'program_eligibility_checks_user_id_fkey',
    'system_settings_updated_by_fkey', 
    'activity_logs_user_id_fkey'
  );

-- Check if any legacy users still exist (created before 2025)
SELECT id, email, created_at 
FROM auth.users 
WHERE created_at < '2025-01-01'
ORDER BY created_at;

-- Final cleanup: ensure no orphaned records remain in any table
-- Check for any remaining problematic foreign key relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users'
  AND tc.table_schema = 'public'
  AND (rc.delete_rule = 'NO ACTION' OR rc.delete_rule IS NULL);