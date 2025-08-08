-- Update the specific professional record with missing license number
UPDATE professionals 
SET license_number = 'License Pending'
WHERE user_id = 'cf6261b1-4860-4ee8-aa22-0aca791afe63' 
  AND (license_number IS NULL OR license_number = '');