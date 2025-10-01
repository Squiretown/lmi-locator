// src/lib/supabase/edge-functions.ts
import { supabase } from '@/integrations/supabase/client';
import { getValidSession } from '@/lib/auth/getValidSession';

/**
 * Invoke a Supabase Edge Function with proper authentication
 * This ensures the Authorization header is always included
 * 
 * @param functionName - Name of the edge function to invoke
 * @param body - Request payload
 * @returns Promise with the function response
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body?: any
): Promise<{ data: T | null; error: any }> {
  try {
    // Step 1: Ensure we have a valid session and get the token
    await getValidSession();
    
    // Step 2: Get the current session to extract the access token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('No valid session found. Please log in again.');
    }
    
    // Step 3: Call the edge function WITH the Authorization header
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: body || {},
      headers: {
        Authorization: `Bearer ${session.access_token}`, // ← THIS IS THE KEY!
      },
    });
    
    return { data, error };
  } catch (error) {
    console.error(`Error invoking edge function ${functionName}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Alternative: Invoke edge function with explicit token
 * Use this if you already have the session/token
 */
export async function invokeEdgeFunctionWithToken<T = any>(
  functionName: string,
  accessToken: string,
  body?: any
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: body || {},
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return { data, error };
  } catch (error) {
    console.error(`Error invoking edge function ${functionName}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}
