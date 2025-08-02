import { useState, useCallback } from 'react';
import { validateFormInput, sanitizeInput } from '@/lib/security/validation';
import { generateCSRFToken, validateCSRFToken } from '@/lib/security/csrf';

interface FormField {
  value: string;
  isValid: boolean;
  errors: string[];
  sanitized: string;
}

interface UseSecureFormProps {
  initialValues: Record<string, string>;
  validationRules?: Record<string, {
    required?: boolean;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  }>;
  enableCSRF?: boolean;
}

export function useSecureForm({
  initialValues,
  validationRules = {},
  enableCSRF = true
}: UseSecureFormProps) {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initialFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        value: initialValues[key] || '',
        isValid: true,
        errors: [],
        sanitized: sanitizeInput(initialValues[key] || '')
      };
    });
    return initialFields;
  });

  const [csrfToken] = useState(() => enableCSRF ? generateCSRFToken() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: string) => {
    const rules = validationRules[name];
    const validation = validateFormInput(value, rules?.maxLength);
    const errors = [...validation.errors];

    // Apply additional validation rules
    if (rules) {
      if (rules.required && !value.trim()) {
        errors.push(`${name} is required`);
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.push(`${name} format is invalid`);
      }

      if (rules.customValidator && value) {
        const customError = rules.customValidator(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    return {
      value,
      isValid: errors.length === 0 && validation.isValid,
      errors,
      sanitized: validation.sanitized
    };
  }, [validationRules]);

  const updateField = useCallback((name: string, value: string) => {
    const validatedField = validateField(name, value);
    setFields(prev => ({
      ...prev,
      [name]: validatedField
    }));
  }, [validateField]);

  const validateForm = useCallback(() => {
    const updatedFields: Record<string, FormField> = {};
    let isFormValid = true;

    Object.keys(fields).forEach(name => {
      const field = validateField(name, fields[name].value);
      updatedFields[name] = field;
      if (!field.isValid) {
        isFormValid = false;
      }
    });

    setFields(updatedFields);
    return isFormValid;
  }, [fields, validateField]);

  const getSecureFormData = useCallback(() => {
    const secureData: Record<string, string> = {};
    Object.keys(fields).forEach(key => {
      secureData[key] = fields[key].sanitized;
    });

    if (enableCSRF) {
      secureData._csrf_token = csrfToken;
    }

    return secureData;
  }, [fields, csrfToken, enableCSRF]);

  const submitForm = useCallback(async (
    submitHandler: (data: Record<string, string>) => Promise<void>
  ) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validate CSRF token if enabled
      if (enableCSRF && !validateCSRFToken(csrfToken)) {
        throw new Error('Security validation failed. Please refresh the page and try again.');
      }

      // Validate all fields
      if (!validateForm()) {
        throw new Error('Please correct the errors in the form');
      }

      // Get sanitized data
      const secureData = getSecureFormData();

      // Submit the form
      await submitHandler(secureData);

    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, enableCSRF, csrfToken, validateForm, getSecureFormData]);

  const resetForm = useCallback(() => {
    const resetFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      resetFields[key] = {
        value: initialValues[key] || '',
        isValid: true,
        errors: [],
        sanitized: sanitizeInput(initialValues[key] || '')
      };
    });
    setFields(resetFields);
  }, [initialValues]);

  return {
    fields,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    isSubmitting,
    csrfToken,
    getSecureFormData,
    isFormValid: Object.values(fields).every(field => field.isValid)
  };
}