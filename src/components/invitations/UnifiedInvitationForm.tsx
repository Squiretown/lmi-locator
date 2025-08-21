import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Building, DollarSign, Mail, MessageSquare } from 'lucide-react';
import type { CreateInvitationRequest, UserType, PropertyInterest, ProfessionalType, SendVia } from '@/types/unified-invitations';

// Validation schemas
const baseInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  userType: z.enum(['client', 'realtor', 'mortgage_professional']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  sendVia: z.enum(['email', 'sms', 'both']).default('email'),
  customMessage: z.string().optional(),
});

const clientInvitationSchema = baseInvitationSchema.extend({
  userType: z.literal('client'),
  propertyInterest: z.enum(['buying', 'selling', 'refinancing']),
  estimatedBudget: z.number().positive().optional(),
  preferredContact: z.enum(['email', 'phone', 'text']).default('email'),
});

const professionalInvitationSchema = baseInvitationSchema.extend({
  userType: z.enum(['realtor', 'mortgage_professional']),
  professionalType: z.enum(['realtor', 'mortgage_broker', 'lender']),
  licenseNumber: z.string().optional(),
  licenseState: z.string().length(2).optional(),
  companyName: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  requiresApproval: z.boolean().default(false),
});

const unifiedInvitationSchema = z.discriminatedUnion('userType', [
  clientInvitationSchema,
  professionalInvitationSchema,
]);

type InvitationFormData = z.infer<typeof unifiedInvitationSchema>;

interface UnifiedInvitationFormProps {
  onSubmit: (data: CreateInvitationRequest) => Promise<void>;
  isLoading?: boolean;
  defaultUserType?: UserType;
}

export const UnifiedInvitationForm: React.FC<UnifiedInvitationFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultUserType = 'client'
}) => {
  const [userType, setUserType] = useState<UserType>(defaultUserType);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InvitationFormData>({
    resolver: zodResolver(unifiedInvitationSchema),
    defaultValues: {
      userType: defaultUserType,
      sendVia: 'email',
      preferredContact: 'email',
      requiresApproval: false,
    }
  });

  const watchedUserType = watch('userType');
  const watchedSendVia = watch('sendVia');

  // Update local state when form user type changes
  React.useEffect(() => {
    setUserType(watchedUserType);
  }, [watchedUserType]);

  const handleFormSubmit = async (data: InvitationFormData) => {
    try {
      await onSubmit(data as CreateInvitationRequest);
      reset();
    } catch (error) {
      console.error('Failed to submit invitation:', error);
    }
  };

  const isClientType = userType === 'client';
  const isProfessionalType = userType === 'realtor' || userType === 'mortgage_professional';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Send Invitation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          
          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Who are you inviting?</Label>
            <RadioGroup
              value={userType}
              onValueChange={(value: UserType) => {
                setValue('userType', value);
                setUserType(value);
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                <RadioGroupItem value="client" id="client" />
                <Label htmlFor="client" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Client
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                <RadioGroupItem value="realtor" id="realtor" />
                <Label htmlFor="realtor" className="flex items-center gap-2 cursor-pointer">
                  <Building className="h-4 w-4" />
                  Realtor
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                <RadioGroupItem value="mortgage_professional" id="mortgage_professional" />
                <Label htmlFor="mortgage_professional" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Mortgage Pro
                </Label>
              </div>
            </RadioGroup>
            {errors.userType && (
              <p className="text-sm text-destructive">{errors.userType.message}</p>
            )}
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="Enter phone number (optional)"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Client-Specific Fields */}
          {isClientType && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Client Details
                </h3>

                <div>
                  <Label htmlFor="propertyInterest">Property Interest *</Label>
                  <Select onValueChange={(value: PropertyInterest) => setValue('propertyInterest', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buying">Buying</SelectItem>
                      <SelectItem value="selling">Selling</SelectItem>
                      <SelectItem value="refinancing">Refinancing</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyInterest && (
                    <p className="text-sm text-destructive mt-1">{(errors as any).propertyInterest.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedBudget">Estimated Budget</Label>
                  <Input
                    id="estimatedBudget"
                    type="number"
                    {...register('estimatedBudget', { valueAsNumber: true })}
                    placeholder="Enter estimated budget (optional)"
                  />
                  {errors.estimatedBudget && (
                    <p className="text-sm text-destructive mt-1">{(errors as any).estimatedBudget.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                  <Select onValueChange={(value: 'email' | 'phone' | 'text') => setValue('preferredContact', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Professional-Specific Fields */}
          {isProfessionalType && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Professional Details
                </h3>

                <div>
                  <Label htmlFor="professionalType">Professional Type *</Label>
                  <Select onValueChange={(value: ProfessionalType) => setValue('professionalType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select professional type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtor">Realtor</SelectItem>
                      <SelectItem value="mortgage_broker">Mortgage Broker</SelectItem>
                      <SelectItem value="lender">Lender</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.professionalType && (
                    <p className="text-sm text-destructive mt-1">{(errors as any).professionalType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      {...register('licenseNumber')}
                      placeholder="Enter license number (optional)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="licenseState">License State</Label>
                    <Input
                      id="licenseState"
                      {...register('licenseState')}
                      placeholder="e.g. CA, NY"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    placeholder="Enter company name (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    {...register('yearsExperience', { valueAsNumber: true })}
                    placeholder="Enter years of experience (optional)"
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {/* Communication Settings */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Communication Settings</h3>

            <div>
              <Label>Send Invitation Via</Label>
              <RadioGroup
                value={watchedSendVia}
                onValueChange={(value: SendVia) => setValue('sendVia', value)}
                className="flex flex-row gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-only" />
                  <Label htmlFor="email-only" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms-only" />
                  <Label htmlFor="sms-only" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <MessageSquare className="h-4 w-4" />
                    Both
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="customMessage">Personal Message</Label>
              <Textarea
                id="customMessage"
                {...register('customMessage')}
                placeholder="Add a personal message to the invitation (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            {(isSubmitting || isLoading) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Invitation...
              </>
            ) : (
              `Send ${userType} Invitation`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};