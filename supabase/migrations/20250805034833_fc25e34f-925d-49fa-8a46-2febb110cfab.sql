-- Phase 1: Create tables with proper foreign key references
-- Create permissions table first (no dependencies)
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name text UNIQUE NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'general',
    created_at timestamp with time zone DEFAULT now()
);

-- Create role_permissions table (depends on permissions)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role text NOT NULL CHECK (role IN ('admin', 'mortgage_professional', 'realtor', 'client')),
    permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(role, permission_id)
);

-- Create user_roles table without foreign key to auth.users for now
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,  -- Remove foreign key constraint for now
    role text NOT NULL CHECK (role IN ('admin', 'mortgage_professional', 'realtor', 'client')),
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid,  -- Remove foreign key constraint for now
    UNIQUE(user_id, role)
);