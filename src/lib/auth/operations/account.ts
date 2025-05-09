
import { deleteUserAccount } from '@/lib/supabase/user-management';

export async function deleteUserWithPassword(currentPassword: string) {
  try {
    const result = await deleteUserAccount(currentPassword);
    
    if (result.success) {
      // Toast notification removed
    } else if (result.error) {
      // Toast notification removed
    }
    
    return result;
  } catch (err) {
    console.error('Exception during account deletion:', err);
    // Toast notification removed
    return { success: false, error: err as Error };
  }
}
