-- Fix ambiguous column reference error in delete_user_references function
CREATE OR REPLACE FUNCTION public.delete_user_references(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deletion_log jsonb := '{}';
  row_count integer;
  professional_ids uuid[];
BEGIN
  -- Get all professional IDs for this user
  SELECT ARRAY_AGG(p.id) INTO professional_ids FROM professionals p WHERE p.user_id = p_user_id;
  
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
  DELETE FROM activity_logs al WHERE al.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('activity_logs', row_count);
  
  DELETE FROM admin_error_logs ael WHERE ael.admin_user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('admin_error_logs', row_count);
  
  DELETE FROM alerts a WHERE a.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('alerts', row_count);
  
  DELETE FROM batch_search_jobs bsj WHERE bsj.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('batch_search_jobs', row_count);
  
  DELETE FROM blog_posts bp WHERE bp.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('blog_posts', row_count);
  
  DELETE FROM census_tract_searches cts WHERE cts.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('census_tract_searches', row_count);
  
  DELETE FROM data_import_log dil WHERE dil.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('data_import_log', row_count);
  
  DELETE FROM lmi_search_error_logs lsel WHERE lsel.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('lmi_search_error_logs', row_count);
  
  DELETE FROM saved_properties sp WHERE sp.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('saved_properties', row_count);
  
  -- Delete professionals last (parent table)
  DELETE FROM professionals p WHERE p.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('professionals', row_count);
  
  -- Delete user profiles last
  DELETE FROM user_profiles up WHERE up.user_id = p_user_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  deletion_log := deletion_log || jsonb_build_object('user_profiles', row_count);
  
  RETURN deletion_log;
END;
$function$