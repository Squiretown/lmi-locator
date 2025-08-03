-- Clean up redundant user deletion functions - keeping only delete_user_references
DROP FUNCTION IF EXISTS public.delete_user(uuid);
DROP FUNCTION IF EXISTS public.delete_user_safely(uuid);
DROP FUNCTION IF EXISTS public.delete_user_safely_v2(uuid);
DROP FUNCTION IF EXISTS public.delete_user_audit_refs(uuid);
DROP FUNCTION IF EXISTS public.delete_user_owned_data(uuid);
DROP FUNCTION IF EXISTS public.delete_user_auth_record(uuid);
DROP FUNCTION IF EXISTS public.delete_user_relationships(uuid);

-- Ensure delete_user_references exists and is optimized
CREATE OR REPLACE FUNCTION public.delete_user_references(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb := '{"success": true, "deleted_records": {}}'::jsonb;
    deleted_count integer;
BEGIN
    -- Delete from user-related tables
    DELETE FROM client_profiles WHERE professional_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,client_profiles}', deleted_count::text::jsonb);
    
    DELETE FROM client_team_assignments WHERE professional_id = user_id OR assigned_by = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,client_team_assignments}', deleted_count::text::jsonb);
    
    DELETE FROM client_communications WHERE professional_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,client_communications}', deleted_count::text::jsonb);
    
    DELETE FROM client_activity_logs WHERE professional_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,client_activity_logs}', deleted_count::text::jsonb);
    
    DELETE FROM client_invitations WHERE professional_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,client_invitations}', deleted_count::text::jsonb);
    
    DELETE FROM contacts WHERE owner_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,contacts}', deleted_count::text::jsonb);
    
    DELETE FROM contacts_invited WHERE inviter_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,contacts_invited}', deleted_count::text::jsonb);
    
    DELETE FROM activity_logs WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,activity_logs}', deleted_count::text::jsonb);
    
    DELETE FROM admin_error_logs WHERE admin_user_id = user_id OR target_user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,admin_error_logs}', deleted_count::text::jsonb);
    
    -- Add other user-related tables as needed
    DELETE FROM census_tract_searches WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,census_tract_searches}', deleted_count::text::jsonb);
    
    DELETE FROM batch_search_jobs WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,batch_search_jobs}', deleted_count::text::jsonb);
    
    DELETE FROM alerts WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,alerts}', deleted_count::text::jsonb);

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$;