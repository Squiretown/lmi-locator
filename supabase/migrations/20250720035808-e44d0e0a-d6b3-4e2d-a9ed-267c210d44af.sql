
-- Add visibility settings to professionals table
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"visible_to_clients": true, "showcase_role": null, "showcase_description": null}'::jsonb;

-- Add team showcase to client invitations table  
ALTER TABLE public.client_invitations
ADD COLUMN IF NOT EXISTS team_showcase JSONB DEFAULT NULL;

-- Update existing professionals with default visibility settings
UPDATE public.professionals 
SET visibility_settings = '{"visible_to_clients": true, "showcase_role": null, "showcase_description": null}'::jsonb
WHERE visibility_settings IS NULL;
