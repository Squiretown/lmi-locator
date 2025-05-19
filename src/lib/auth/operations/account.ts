
import { deleteUserAccount } from '@/lib/supabase/user-management';
import { toast } from 'sonner';

export async function deleteUserWithPassword(currentPassword: string) {
  try {
    const result = await deleteUserAccount(currentPassword);
    
    if (result.success) {
      toast.success("Account deleted", {
        description: "Your account has been successfully deleted"
      });
    } else if (result.error) {
      toast.error("Account deletion failed", {
        description: result.error.message || "Unable to delete your account"
      });
    }
    
    return result;
  } catch (err) {
    console.error('Exception during account deletion:', err);
    toast.error("Account deletion failed", {
      description: "An unexpected error occurred while deleting your account"
    });
    return { success: false, error: err as Error };
  }
}
