-- Simple step-by-step role system cleanup migration
-- Step 1: Update the enum with new values

ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'realtor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'mortgage_professional';