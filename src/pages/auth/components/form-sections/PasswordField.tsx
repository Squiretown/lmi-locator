
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { SignupFormValues } from '../types/auth-form-types';
import PasswordRequirements from '../PasswordRequirements';

interface PasswordFieldProps {
  form: UseFormReturn<SignupFormValues>;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ form }) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = form.watch('password');
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormControl>
          <PasswordRequirements password={passwordValue} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PasswordField;
