
import { deleteUserAccount } from '@/lib/supabase/user-management';

export async function deleteUserWithPassword(currentPassword: string) {
  try {
    const result = await deleteUserAccount(currentPassword);
    
    if (!result.success && result.error) {
      console.error("Account deletion failed:", result.error.message);
    }
    
    return result;
  } catch (err) {
    console.error('Exception during account deletion:', err);
    return { success: false, error: err as Error };
  }
}
