-- Create modular user deletion functions with proper error handling

-- Function 1: Handle audit field nullification
CREATE OR REPLACE FUNCTION public.delete_user_audit_refs(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{"success": true, "updated_records": {}}'::JSONB;
    updated_count INTEGER;
BEGIN
    -- Nullify audit references
    UPDATE admin_message_templates SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,admin_message_templates}', to_jsonb(updated_count));

    UPDATE communication_templates SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,communication_templates}', to_jsonb(updated_count));

    UPDATE help_items SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,help_items}', to_jsonb(updated_count));

    UPDATE ffiec_import_jobs SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,ffiec_import_jobs}', to_jsonb(updated_count));

    UPDATE client_profiles SET deactivated_by = NULL WHERE deactivated_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,client_profiles_deactivated_by}', to_jsonb(updated_count));

    UPDATE client_team_assignments SET assigned_by = NULL WHERE assigned_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,client_team_assignments_assigned_by}', to_jsonb(updated_count));

    UPDATE contacts_invited SET registered_user_id = NULL WHERE registered_user_id = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,contacts_invited_registered_user}', to_jsonb(updated_count));

    UPDATE admin_error_logs SET resolved_by = NULL WHERE resolved_by = target_user_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    result := jsonb_set(result, '{updated_records,admin_error_logs_resolved_by}', to_jsonb(updated_count));

    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE,
        'function', 'delete_user_audit_refs'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Handle user-owned data deletion
CREATE OR REPLACE FUNCTION public.delete_user_owned_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{"success": true, "deleted_records": {}}'::JSONB;
    deleted_count INTEGER;
BEGIN
    -- Delete user-owned records in dependency order
    DELETE FROM alerts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,alerts}', to_jsonb(deleted_count));

    DELETE FROM search_history WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,search_history}', to_jsonb(deleted_count));

    DELETE FROM batch_search_jobs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,batch_search_jobs}', to_jsonb(deleted_count));

    DELETE FROM census_tract_searches WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,census_tract_searches}', to_jsonb(deleted_count));

    DELETE FROM marketing_jobs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,marketing_jobs}', to_jsonb(deleted_count));

    DELETE FROM saved_addresses WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,saved_addresses}', to_jsonb(deleted_count));

    DELETE FROM saved_properties WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,saved_properties}', to_jsonb(deleted_count));

    DELETE FROM program_eligibility_checks WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,program_eligibility_checks}', to_jsonb(deleted_count));

    DELETE FROM notification_preferences WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,notification_preferences}', to_jsonb(deleted_count));

    DELETE FROM activity_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,activity_logs}', to_jsonb(deleted_count));

    DELETE FROM data_import_log WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,data_import_log}', to_jsonb(deleted_count));

    DELETE FROM lmi_search_error_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,lmi_search_error_logs}', to_jsonb(deleted_count));

    DELETE FROM blog_posts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,blog_posts}', to_jsonb(deleted_count));

    DELETE FROM testimonials WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,testimonials}', to_jsonb(deleted_count));

    DELETE FROM resources WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,resources}', to_jsonb(deleted_count));

    DELETE FROM admin_error_logs WHERE admin_user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,admin_error_logs}', to_jsonb(deleted_count));

    DELETE FROM contacts_invited WHERE inviter_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,contacts_invited_as_inviter}', to_jsonb(deleted_count));

    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE,
        'function', 'delete_user_owned_data'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Handle professional/client relationships
CREATE OR REPLACE FUNCTION public.delete_user_relationships(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{"success": true, "deleted_records": {}}'::JSONB;
    deleted_count INTEGER;
    prof_id UUID;
BEGIN
    -- Get professional ID if exists
    SELECT id INTO prof_id FROM professionals WHERE user_id = target_user_id;
    
    IF prof_id IS NOT NULL THEN
        -- Delete professional-related data
        DELETE FROM client_activity_logs WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,client_activity_logs}', to_jsonb(deleted_count));

        DELETE FROM client_communications WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,client_communications}', to_jsonb(deleted_count));

        DELETE FROM client_invitations WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,client_invitations}', to_jsonb(deleted_count));

        DELETE FROM client_team_assignments WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,client_team_assignments}', to_jsonb(deleted_count));

        DELETE FROM client_profiles WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,client_profiles}', to_jsonb(deleted_count));

        DELETE FROM clients WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,clients}', to_jsonb(deleted_count));

        DELETE FROM contacts WHERE owner_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,contacts}', to_jsonb(deleted_count));

        DELETE FROM contact_interactions WHERE user_id = target_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,contact_interactions}', to_jsonb(deleted_count));

        DELETE FROM professional_leads WHERE professional_id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,professional_leads}', to_jsonb(deleted_count));

        DELETE FROM professionals WHERE id = prof_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := jsonb_set(result, '{deleted_records,professionals}', to_jsonb(deleted_count));
    END IF;

    -- Delete user profiles
    DELETE FROM user_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,user_profiles}', to_jsonb(deleted_count));

    DELETE FROM users_profile WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,users_profile}', to_jsonb(deleted_count));

    DELETE FROM user_roles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{deleted_records,user_roles}', to_jsonb(deleted_count));

    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE,
        'function', 'delete_user_relationships'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Delete from auth.users (final step)
CREATE OR REPLACE FUNCTION public.delete_user_auth_record(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete from auth.users using admin privileges
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'deleted_records', jsonb_build_object('auth_users', deleted_count)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE,
        'function', 'delete_user_auth_record'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Main orchestrating function
CREATE OR REPLACE FUNCTION public.delete_user_safely_v2(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    step_result JSONB;
    final_result JSONB := '{"success": true, "steps": [], "deleted_records": {}, "updated_records": {}}'::JSONB;
    total_deleted INTEGER := 0;
    total_updated INTEGER := 0;
BEGIN
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', target_user_id
        );
    END IF;

    -- Step 1: Handle audit references
    step_result := delete_user_audit_refs(target_user_id);
    final_result := jsonb_set(final_result, '{steps}', 
        (final_result->'steps') || jsonb_build_array(jsonb_build_object('step', 'audit_refs', 'result', step_result)));
    
    IF NOT (step_result->>'success')::BOOLEAN THEN
        RETURN jsonb_set(final_result, '{success}', 'false'::jsonb) || 
               jsonb_build_object('error', 'Failed at audit_refs step', 'step_error', step_result);
    END IF;

    -- Merge updated_records
    final_result := jsonb_set(final_result, '{updated_records}', 
        (final_result->'updated_records') || (step_result->'updated_records'));

    -- Step 2: Delete user-owned data
    step_result := delete_user_owned_data(target_user_id);
    final_result := jsonb_set(final_result, '{steps}', 
        (final_result->'steps') || jsonb_build_array(jsonb_build_object('step', 'owned_data', 'result', step_result)));
    
    IF NOT (step_result->>'success')::BOOLEAN THEN
        RETURN jsonb_set(final_result, '{success}', 'false'::jsonb) || 
               jsonb_build_object('error', 'Failed at owned_data step', 'step_error', step_result);
    END IF;

    -- Merge deleted_records
    final_result := jsonb_set(final_result, '{deleted_records}', 
        (final_result->'deleted_records') || (step_result->'deleted_records'));

    -- Step 3: Handle relationships
    step_result := delete_user_relationships(target_user_id);
    final_result := jsonb_set(final_result, '{steps}', 
        (final_result->'steps') || jsonb_build_array(jsonb_build_object('step', 'relationships', 'result', step_result)));
    
    IF NOT (step_result->>'success')::BOOLEAN THEN
        RETURN jsonb_set(final_result, '{success}', 'false'::jsonb) || 
               jsonb_build_object('error', 'Failed at relationships step', 'step_error', step_result);
    END IF;

    -- Merge deleted_records
    final_result := jsonb_set(final_result, '{deleted_records}', 
        (final_result->'deleted_records') || (step_result->'deleted_records'));

    -- Step 4: Delete auth record
    step_result := delete_user_auth_record(target_user_id);
    final_result := jsonb_set(final_result, '{steps}', 
        (final_result->'steps') || jsonb_build_array(jsonb_build_object('step', 'auth_record', 'result', step_result)));
    
    IF NOT (step_result->>'success')::BOOLEAN THEN
        RETURN jsonb_set(final_result, '{success}', 'false'::jsonb) || 
               jsonb_build_object('error', 'Failed at auth_record step', 'step_error', step_result);
    END IF;

    -- Merge deleted_records
    final_result := jsonb_set(final_result, '{deleted_records}', 
        (final_result->'deleted_records') || (step_result->'deleted_records'));

    -- Add summary
    final_result := final_result || jsonb_build_object(
        'message', 'User successfully deleted',
        'user_id', target_user_id
    );

    RETURN final_result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE,
        'function', 'delete_user_safely_v2',
        'user_id', target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;