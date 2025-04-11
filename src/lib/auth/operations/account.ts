
import { toast } from 'sonner';
import { deleteUserAccount } from '@/lib/supabase/user-management';

export async function deleteUserWithPassword(currentPassword: string) {
  try {
    const result = await deleteUserAccount(currentPassword);
    
    if (result.success) {
      toast.success('Your account has been deleted successfully');
    } else if (result.error) {
      toast.error(`Failed to delete account: ${result.error.message}`);
    }
    
    return result;
  } catch (err) {
    console.error('Exception during account deletion:', err);
    toast.error('An unexpected error occurred while deleting your account');
    return { success: false, error: err as Error };
  }
}
