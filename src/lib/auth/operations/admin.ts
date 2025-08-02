
import { supabase } from "@/integrations/supabase/client";

/**
 * DEPRECATED: This function poses a security risk and should not be used in production.
 * Admin accounts should be created through secure channels only.
 * This function is disabled to prevent unauthorized admin account creation.
 */
export async function createInitialAdminUser() {
  console.warn('SECURITY WARNING: createInitialAdminUser function is disabled for security reasons');
  console.warn('Admin accounts should be created through secure administrative channels only');
  return null;
}
