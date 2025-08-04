-- Fix security warnings from linter

-- Fix function search_path issues (WARN 1-3)
CREATE OR REPLACE FUNCTION public.diagnose_user_data(target_user_id uuid)
RETURNS TABLE(
  table_name text,
  record_count bigint,
  sample_ids text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 'activity_logs'::text, COUNT(*), ARRAY_AGG(al.id::text) FROM activity_logs al WHERE al.user_id = target_user_id
  UNION ALL
  SELECT 'admin_error_logs'::text, COUNT(*), ARRAY_AGG(ael.id::text) FROM admin_error_logs ael WHERE ael.admin_user_id = target_user_id
  UNION ALL
  SELECT 'alerts'::text, COUNT(*), ARRAY_AGG(a.id::text) FROM alerts a WHERE a.user_id = target_user_id
  UNION ALL
  SELECT 'batch_search_jobs'::text, COUNT(*), ARRAY_AGG(bsj.id::text) FROM batch_search_jobs bsj WHERE bsj.user_id = target_user_id
  UNION ALL
  SELECT 'blog_posts'::text, COUNT(*), ARRAY_AGG(bp.id::text) FROM blog_posts bp WHERE bp.user_id = target_user_id
  UNION ALL
  SELECT 'census_tract_searches'::text, COUNT(*), ARRAY_AGG(cts.id::text) FROM census_tract_searches cts WHERE cts.user_id = target_user_id
  UNION ALL
  SELECT 'data_import_log'::text, COUNT(*), ARRAY_AGG(dil.id::text) FROM data_import_log dil WHERE dil.user_id = target_user_id
  UNION ALL
  SELECT 'lmi_search_error_logs'::text, COUNT(*), ARRAY_AGG(lsel.id::text) FROM lmi_search_error_logs lsel WHERE lsel.user_id = target_user_id
  UNION ALL
  SELECT 'professionals'::text, COUNT(*), ARRAY_AGG(p.id::text) FROM professionals p WHERE p.user_id = target_user_id
  UNION ALL
  SELECT 'saved_properties'::text, COUNT(*), ARRAY_AGG(sp.id::text) FROM saved_properties sp WHERE sp.user_id = target_user_id
  UNION ALL
  SELECT 'user_profiles'::text, COUNT(*), ARRAY_AGG(up.id::text) FROM user_profiles up WHERE up.user_id = target_user_id
  UNION ALL
  SELECT 'client_profiles'::text, COUNT(*), ARRAY_AGG(cp.id::text) FROM client_profiles cp 
  JOIN professionals p ON cp.professional_id = p.id WHERE p.user_id = target_user_id
  UNION ALL
  SELECT 'contacts'::text, COUNT(*), ARRAY_AGG(c.id::text) FROM contacts c 
  JOIN professionals p ON c.owner_id = p.id WHERE p.user_id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_references(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deletion_log jsonb := '{}';
  row_count integer;
  professional_ids uuid[];
BEGIN
  -- Get all professional IDs for this user
  SELECT ARRAY_AGG(p.id) INTO professional_ids FROM professionals p WHERE p.user_id = target_user_id;
  
  -- Delete in dependency order (children first)
  IF professional_ids IS NOT NULL THEN
    DELETE FROM client_communications cc WHERE cc.professional_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('client_communications', row_count);
    
    DELETE FROM client_activity_logs cal WHERE cal.professional_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('client_activity_logs', row_count);
    
    DELETE FROM client_invitations ci WHERE ci.professional_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('client_invitations', row_count);
    
    DELETE FROM client_team_assignments cta WHERE cta.professional_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('client_team_assignments', row_count);
    
    DELETE FROM client_profiles cp WHERE cp.professional_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('client_profiles', row_count);
    
    DELETE FROM clients c WHERE c.professional_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('clients', row_count);
    
    DELETE FROM contact_interactions coi WHERE coi.contact_id IN (
      SELECT co.id FROM contacts co WHERE co.owner_id = ANY(professional_ids)
    );
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('contact_interactions', row_count);
    
    DELETE FROM contacts co WHERE co.owner_id = ANY(professional_ids);
    GET DIAGNOSTICS row_count = ROW_COUNT;
    deletion_log := deletion_log || jsonb_build_object('contacts', row_count);
  END IF;
  
  -- Direct user references
  DELETE FROM activity_logs al WHERE al.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('activity_logs', row_count);
  
  DELETE FROM admin_error_logs ael WHERE ael.admin_user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('admin_error_logs', row_count);
  
  DELETE FROM alerts a WHERE a.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('alerts', row_count);
  
  DELETE FROM batch_search_jobs bsj WHERE bsj.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('batch_search_jobs', row_count);
  
  DELETE FROM blog_posts bp WHERE bp.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('blog_posts', row_count);
  
  DELETE FROM census_tract_searches cts WHERE cts.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('census_tract_searches', row_count);
  
  DELETE FROM data_import_log dil WHERE dil.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('data_import_log', row_count);
  
  DELETE FROM lmi_search_error_logs lsel WHERE lsel.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('lmi_search_error_logs', row_count);
  
  DELETE FROM saved_properties sp WHERE sp.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('saved_properties', row_count);
  
  -- Delete professionals last (parent table)
  DELETE FROM professionals p WHERE p.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('professionals', row_count);
  
  -- Delete user profiles last
  DELETE FROM user_profiles up WHERE up.user_id = target_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('user_profiles', row_count);
  
  RETURN deletion_log;
END;
$$;