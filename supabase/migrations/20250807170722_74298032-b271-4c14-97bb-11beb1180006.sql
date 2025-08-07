-- Fix the invitation record to use the correct professional ID
-- The current user (0baa9726-2d48-4137-bf69-1a037cccd249) has professional ID 5b58bd62-efff-4aeb-a293-2b3a861f501d
-- But the invitation record incorrectly references professional ID 912998b3-54ba-4eec-bd1b-37f76dfe6522

UPDATE public.client_invitations 
SET professional_id = '5b58bd62-efff-4aeb-a293-2b3a861f501d',
    updated_at = now()
WHERE professional_id = '912998b3-54ba-4eec-bd1b-37f76dfe6522'
  AND status = 'pending';

-- Log the correction
INSERT INTO public.activity_logs (activity_type, description, data) 
VALUES ('system', 'Fixed invitation professional ID references', 
        jsonb_build_object('timestamp', now(), 'action', 'invitation_professional_id_fix'));