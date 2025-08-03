-- Complete user deletion function that handles all foreign key dependencies
CREATE OR REPLACE FUNCTION delete_user_safely(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    record_counts JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- Count records before deletion for reporting
        SELECT json_build_object(
            'alerts', (SELECT COUNT(*) FROM alerts WHERE user_id = target_user_id),
            'activity_logs', (SELECT COUNT(*) FROM activity_logs WHERE user_id = target_user_id),
            'saved_properties', (SELECT COUNT(*) FROM saved_properties WHERE user_id = target_user_id),
            'search_history', (SELECT COUNT(*) FROM search_history WHERE user_id = target_user_id),
            'census_tract_searches', (SELECT COUNT(*) FROM census_tract_searches WHERE user_id = target_user_id),
            'batch_search_jobs', (SELECT COUNT(*) FROM batch_search_jobs WHERE user_id = target_user_id),
            'client_profiles_deactivated', (SELECT COUNT(*) FROM client_profiles WHERE deactivated_by = target_user_id),
            'theme_settings_updated', (SELECT COUNT(*) FROM theme_settings WHERE updated_by = target_user_id),
            'system_settings_updated', (SELECT COUNT(*) FROM system_settings WHERE updated_by = target_user_id)
        ) INTO record_counts;

        -- Delete user-owned records (safe to delete)
        DELETE FROM alerts WHERE user_id = target_user_id;
        DELETE FROM activity_logs WHERE user_id = target_user_id;
        DELETE FROM saved_properties WHERE user_id = target_user_id;
        DELETE FROM search_history WHERE user_id = target_user_id;
        DELETE FROM census_tract_searches WHERE user_id = target_user_id;
        DELETE FROM batch_search_jobs WHERE user_id = target_user_id;

        -- Handle settings and profile tables (set foreign keys to NULL instead of deleting)
        UPDATE client_profiles 
        SET deactivated_by = NULL 
        WHERE deactivated_by = target_user_id;

        UPDATE theme_settings 
        SET updated_by = NULL 
        WHERE updated_by = target_user_id;

        UPDATE system_settings 
        SET updated_by = NULL 
        WHERE updated_by = target_user_id;

        -- Finally, delete the user from auth.users (this will cascade delete auth-related tables)
        DELETE FROM auth.users WHERE id = target_user_id;

        -- Check if user was actually deleted
        IF NOT FOUND THEN
            RAISE EXCEPTION 'User not found or could not be deleted';
        END IF;

        -- Return success with details
        SELECT json_build_object(
            'success', true,
            'user_id', target_user_id,
            'deleted_records', record_counts,
            'message', 'User and all related data successfully deleted'
        ) INTO result;

        RETURN result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Return error details
            SELECT json_build_object(
                'success', false,
                'user_id', target_user_id,
                'error', SQLERRM,
                'error_code', SQLSTATE,
                'message', 'Failed to delete user: ' || SQLERRM
            ) INTO result;
            
            RETURN result;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION delete_user_safely(UUID) TO service_role;