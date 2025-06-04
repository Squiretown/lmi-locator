
import { z } from 'zod';

// Password regex validation
export const passwordRegex = {
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[^A-Za-z0-9]/
};

// Define the form schema with advanced password validation and referral fields
export const signupFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .refine(val => passwordRegex.hasUppercase.test(val), {
      message: 'Password must include at least one uppercase letter'
    })
    .refine(val => passwordRegex.hasLowercase.test(val), {
      message: 'Password must include at least one lowercase letter'
    })
    .refine(val => passwordRegex.hasNumber.test(val), {
      message: 'Password must include at least one number'
    })
    .refine(val => passwordRegex.hasSpecialChar.test(val), {
      message: 'Password must include at least one special character'
    }),
  userRole: z.enum(['client', 'realtor', 'mortgage_professional']),
  referralCode: z.string().optional(),
  referredByType: z.enum(['mortgage_broker', 'realtor', 'professional', 'none']).optional(),
  referredByName: z.string().optional()
});

// Form values type derived from the schema
export type SignupFormValues = z.infer<typeof signupFormSchema>;
