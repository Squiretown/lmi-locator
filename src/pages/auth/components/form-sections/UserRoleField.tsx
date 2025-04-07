
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { SignupFormValues } from '../types/auth-form-types';

interface UserRoleFieldProps {
  form: UseFormReturn<SignupFormValues>;
}

const UserRoleField: React.FC<UserRoleFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="userRole"
      render={({ field }) => (
        <FormItem>
          <FormLabel>I am a</FormLabel>
          <FormControl>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              {...field}
            >
              <option value="client">Home Buyer / Client</option>
              <option value="realtor">Real Estate Agent</option>
              <option value="mortgage_professional">Mortgage Professional</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserRoleField;
