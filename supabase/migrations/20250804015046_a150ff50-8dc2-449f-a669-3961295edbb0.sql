-- Drop existing function and recreate with comprehensive user deletion logic
DROP FUNCTION IF EXISTS public.delete_user_references(uuid);

-- Create diagnostic function to see what data exists for a user
CREATE OR REPLACE FUNCTION public.diagnose_user_data(target_user_id uuid)
RETURNS TABLE(
  table_name text,
  record_count bigint,
  sample_ids text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return data for all tables that reference the user
  RETURN QUERY
  WITH user_data AS (
    SELECT 'user_profiles' as tbl, COUNT(*)::bigint as cnt, ARRAY_AGG(id::text) FILTER (WHERE id IS NOT NULL) as ids FROM user_profiles WHERE user_id = target_user_id
    UNION ALL
    SELECT 'professionals', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM professionals WHERE user_id = target_user_id
    UNION ALL  
    SELECT 'clients', COUNT(*)::bigint, ARRAY_AGG(client_id::text) FROM clients WHERE professional_id = target_user_id
    UNION ALL
    SELECT 'client_profiles', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM client_profiles WHERE professional_id = target_user_id
    UNION ALL
    SELECT 'contacts', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM contacts WHERE owner_id = target_user_id
    UNION ALL
    SELECT 'contact_interactions', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM contact_interactions WHERE user_id = target_user_id
    UNION ALL
    SELECT 'client_invitations', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM client_invitations WHERE professional_id = target_user_id
    UNION ALL
    SELECT 'client_team_assignments', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM client_team_assignments WHERE professional_id = target_user_id OR assigned_by = target_user_id
    UNION ALL
    SELECT 'client_activity_logs', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM client_activity_logs WHERE professional_id = target_user_id
    UNION ALL
    SELECT 'client_communications', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM client_communications WHERE professional_id = target_user_id
    UNION ALL
    SELECT 'communication_templates', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM communication_templates WHERE created_by = target_user_id
    UNION ALL
    SELECT 'contacts_invited', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM contacts_invited WHERE inviter_id = target_user_id
    UNION ALL
    SELECT 'batch_search_jobs', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM batch_search_jobs WHERE user_id = target_user_id
    UNION ALL
    SELECT 'census_tract_searches', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM census_tract_searches WHERE user_id = target_user_id
    UNION ALL
    SELECT 'alerts', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM alerts WHERE user_id = target_user_id
    UNION ALL
    SELECT 'blog_posts', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM blog_posts WHERE user_id = target_user_id
    UNION ALL
    SELECT 'data_import_log', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM data_import_log WHERE user_id = target_user_id
    UNION ALL
    SELECT 'lmi_search_error_logs', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM lmi_search_error_logs WHERE user_id = target_user_id
    UNION ALL
    SELECT 'admin_error_logs', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM admin_error_logs WHERE admin_user_id = target_user_id OR target_user_id = admin_error_logs.target_user_id OR resolved_by = target_user_id
    UNION ALL
    SELECT 'admin_message_templates', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM admin_message_templates WHERE created_by = target_user_id
    UNION ALL
    SELECT 'help_items', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM help_items WHERE created_by = target_user_id
    UNION ALL
    SELECT 'activity_logs', COUNT(*)::bigint, ARRAY_AGG(id::text) FROM activity_logs WHERE user_id = target_user_id
  )
  SELECT ud.tbl, ud.cnt, ud.ids[1:5] -- Only show first 5 IDs as sample
  FROM user_data ud
  WHERE ud.cnt > 0
  ORDER BY ud.cnt DESC;
END;
$$;

-- Create the comprehensive delete_user_references function
CREATE OR REPLACE FUNCTION public.delete_user_references(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{}';
  deleted_count integer;
  error_msg text;
  professional_ids uuid[];
BEGIN
  RAISE LOG 'Starting comprehensive user deletion for user: %', target_user_id;
  
  -- First, get any professional IDs associated with this user (needed for cascading deletes)
  SELECT ARRAY_AGG(id) INTO professional_ids FROM professionals WHERE user_id = target_user_id;
  
  -- Delete in dependency order to avoid foreign key violations
  
  -- 1. Delete client activity logs first (references professional_id)
  BEGIN
    DELETE FROM client_activity_logs WHERE professional_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{client_activity_logs}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % client activity logs', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{client_activity_logs_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting client activity logs: %', error_msg;
  END;

  -- 2. Delete client communications
  BEGIN
    DELETE FROM client_communications WHERE professional_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{client_communications}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % client communications', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{client_communications_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting client communications: %', error_msg;
  END;

  -- 3. Delete client team assignments
  BEGIN
    DELETE FROM client_team_assignments WHERE professional_id = target_user_id OR assigned_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{client_team_assignments}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % client team assignments', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{client_team_assignments_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting client team assignments: %', error_msg;
  END;

  -- 4. Delete client profiles (references professional_id)
  BEGIN
    DELETE FROM client_profiles WHERE professional_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{client_profiles}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % client profiles', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{client_profiles_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting client profiles: %', error_msg;
  END;

  -- 5. Delete clients (references professional_id)
  BEGIN
    DELETE FROM clients WHERE professional_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{clients}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % clients', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{clients_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting clients: %', error_msg;
  END;

  -- 6. Delete contact interactions (references contacts)
  BEGIN
    DELETE FROM contact_interactions WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{contact_interactions}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % contact interactions', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{contact_interactions_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting contact interactions: %', error_msg;
  END;

  -- 7. Delete contacts (references owner_id)
  BEGIN
    DELETE FROM contacts WHERE owner_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{contacts}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % contacts', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{contacts_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting contacts: %', error_msg;
  END;

  -- 8. Delete client invitations
  BEGIN
    DELETE FROM client_invitations WHERE professional_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{client_invitations}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % client invitations', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{client_invitations_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting client invitations: %', error_msg;
  END;

  -- 9. Delete contacts invited
  BEGIN
    DELETE FROM contacts_invited WHERE inviter_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{contacts_invited}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % contacts invited', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{contacts_invited_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting contacts invited: %', error_msg;
  END;

  -- 10. Delete communication templates
  BEGIN
    DELETE FROM communication_templates WHERE created_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{communication_templates}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % communication templates', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{communication_templates_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting communication templates: %', error_msg;
  END;

  -- 11. Delete batch search jobs
  BEGIN
    DELETE FROM batch_search_jobs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{batch_search_jobs}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % batch search jobs', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{batch_search_jobs_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting batch search jobs: %', error_msg;
  END;

  -- 12. Delete census tract searches
  BEGIN
    DELETE FROM census_tract_searches WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{census_tract_searches}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % census tract searches', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{census_tract_searches_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting census tract searches: %', error_msg;
  END;

  -- 13. Delete alerts
  BEGIN
    DELETE FROM alerts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{alerts}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % alerts', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{alerts_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting alerts: %', error_msg;
  END;

  -- 14. Delete blog posts
  BEGIN
    DELETE FROM blog_posts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{blog_posts}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % blog posts', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{blog_posts_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting blog posts: %', error_msg;
  END;

  -- 15. Delete data import logs
  BEGIN
    DELETE FROM data_import_log WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{data_import_log}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % data import logs', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{data_import_log_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting data import logs: %', error_msg;
  END;

  -- 16. Delete LMI search error logs
  BEGIN
    DELETE FROM lmi_search_error_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{lmi_search_error_logs}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % LMI search error logs', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{lmi_search_error_logs_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting LMI search error logs: %', error_msg;
  END;

  -- 17. Delete admin error logs
  BEGIN
    DELETE FROM admin_error_logs WHERE admin_user_id = target_user_id OR target_user_id = admin_error_logs.target_user_id OR resolved_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{admin_error_logs}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % admin error logs', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{admin_error_logs_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting admin error logs: %', error_msg;
  END;

  -- 18. Delete admin message templates
  BEGIN
    DELETE FROM admin_message_templates WHERE created_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{admin_message_templates}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % admin message templates', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{admin_message_templates_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting admin message templates: %', error_msg;
  END;

  -- 19. Delete help items
  BEGIN
    DELETE FROM help_items WHERE created_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{help_items}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % help items', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{help_items_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting help items: %', error_msg;
  END;

  -- 20. Delete activity logs
  BEGIN
    DELETE FROM activity_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{activity_logs}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % activity logs', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{activity_logs_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting activity logs: %', error_msg;
  END;

  -- 21. Delete broker permissions (if they exist for professional_ids)
  IF professional_ids IS NOT NULL THEN
    BEGIN
      DELETE FROM broker_permissions WHERE broker_id = ANY(professional_ids);
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
      result := jsonb_set(result, '{broker_permissions}', to_jsonb(deleted_count));
      RAISE LOG 'Deleted % broker permissions', deleted_count;
    EXCEPTION WHEN OTHERS THEN
      error_msg := SQLERRM;
      result := jsonb_set(result, '{broker_permissions_error}', to_jsonb(error_msg));
      RAISE LOG 'Error deleting broker permissions: %', error_msg;
    END;
  END IF;

  -- 22. Delete professionals (this must be after all professional_id references)
  BEGIN
    DELETE FROM professionals WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{professionals}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % professionals', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{professionals_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting professionals: %', error_msg;
  END;

  -- 23. Finally, delete user profiles (this should be last)
  BEGIN
    DELETE FROM user_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := jsonb_set(result, '{user_profiles}', to_jsonb(deleted_count));
    RAISE LOG 'Deleted % user profiles', deleted_count;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    result := jsonb_set(result, '{user_profiles_error}', to_jsonb(error_msg));
    RAISE LOG 'Error deleting user profiles: %', error_msg;
  END;

  RAISE LOG 'Completed comprehensive user deletion for user: %', target_user_id;
  RAISE LOG 'Deletion results: %', result;
  
  RETURN result;
END;
$$;