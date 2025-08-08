-- Performance indexes to reduce query latency for invitations and user targeting
CREATE INDEX IF NOT EXISTS idx_client_invitations_professional_id ON public.client_invitations (professional_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON public.client_invitations (status);
CREATE INDEX IF NOT EXISTS idx_client_invitations_invitation_code ON public.client_invitations (invitation_code);
CREATE INDEX IF NOT EXISTS idx_client_invitations_client_email ON public.client_invitations (client_email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_sent_at ON public.client_invitations (sent_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles (user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals (user_id);