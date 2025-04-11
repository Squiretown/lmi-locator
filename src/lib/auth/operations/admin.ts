
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

/**
 * Create an initial admin user if no admins exist
 */
export async function createInitialAdminUser() {
  try {
    // Check if any admin users already exist
    const { data: existingAdmins } = await supabase.rpc('user_is_admin');
    
    if (existingAdmins) {
      console.log('Admin user already exists');
      return null;
    }

    // Create a more secure password with special characters, numbers, and mixed case
    const adminEmail = 'admin@example.com';
    // More complex password that should pass Supabase's strength check
    const adminPassword = `Admin${Math.random().toString(36).slice(2)}!${Math.random().toString(36).toUpperCase().slice(2)}@${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabase.auth.signUp({
      email: adminEmail, 
      password: adminPassword,
      options: { 
        data: {
          user_type: 'admin',
          first_name: 'System',
          last_name: 'Administrator'
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      toast.error('Failed to create initial admin user');
      return null;
    }

    if (data?.user) {
      toast.success('Initial admin user created successfully');
      console.log('Initial admin user created:', data.user.email);
      return { email: adminEmail, password: adminPassword };
    }

    return null;
  } catch (error) {
    console.error('Exception during admin user creation:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}
