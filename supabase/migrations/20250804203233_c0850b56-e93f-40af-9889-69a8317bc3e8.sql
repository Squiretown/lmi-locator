-- Step 1: Check current foreign key constraints for program_eligibility_checks
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'program_eligibility_checks';

-- Step 2: Delete the blocking program_eligibility_checks records
-- First, let's see what records exist
SELECT user_id, count(*) as record_count 
FROM program_eligibility_checks 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE created_at < '2025-01-01'
)
GROUP BY user_id;

-- Delete the blocking records
DELETE FROM program_eligibility_checks 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE created_at < '2025-01-01'
);

-- Step 3: Fix the foreign key constraint to include CASCADE
-- Drop the existing constraint
ALTER TABLE program_eligibility_checks 
DROP CONSTRAINT IF EXISTS program_eligibility_checks_user_id_fkey;

-- Recreate with CASCADE
ALTER TABLE program_eligibility_checks 
ADD CONSTRAINT program_eligibility_checks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Check for other tables that might have similar issues
SELECT 
    tc.table_name,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users'
  AND tc.table_schema = 'public'
  AND (rc.delete_rule IS NULL OR rc.delete_rule != 'CASCADE');

-- Step 5: Fix any other missing CASCADE constraints
-- This will be determined based on the results above