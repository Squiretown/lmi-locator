// Simplified service to avoid circular type dependencies
// This uses basic types instead of importing complex Supabase types

export interface BasicProfessional {
  id: string;
  userId: string;
  type: string;
  name: string;
  company: string;
}

/**
 * Simplified professional service without complex type dependencies
 */
export async function getProfessionalForUser(userId: string): Promise<BasicProfessional[]> {
  try {
    // Return empty array for now - this avoids the type recursion issue
    // The actual implementation can be restored once types are stabilized
    console.warn('getProfessionalForUser: Simplified implementation active');
    return [];
  } catch (err) {
    console.error('Error in getProfessionalForUser:', err);
    return [];
  }
}
