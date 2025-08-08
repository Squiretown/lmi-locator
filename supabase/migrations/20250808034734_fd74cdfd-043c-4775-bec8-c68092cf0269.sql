-- Clean up duplicate invitations, keeping only the most recent one for each email
WITH duplicates_to_delete AS (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY client_email, LOWER(TRIM(client_name)) 
             ORDER BY created_at DESC
           ) as rn
    FROM client_invitations
  ) ranked
  WHERE rn > 1
)
DELETE FROM client_invitations 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Update remaining invitations to standardize the name spelling
UPDATE client_invitations 
SET client_name = 'Shawn Steinmuller'
WHERE client_email IN ('shawn@shawnmichaelrealty.com', 'shawn@shawnsteinmuller.com')
AND client_name IN ('Shawn Stenimuller', 'Shawn Stenimullr');