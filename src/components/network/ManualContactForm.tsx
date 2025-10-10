import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { CreateManualContactRequest, ManualContactType } from '@/types/manual-contacts';

const manualContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  professionalType: z.enum([
    'attorney',
    'title_company',
    'inspector',
    'appraiser',
    'insurance',
    'contractor',
    'other'
  ] as const),
  roleTitle: z.string().optional(),
  notes: z.string().optional(),
  visibleToClients: z.boolean().default(true),
});

interface ManualContactFormProps {
  onSubmit: (data: CreateManualContactRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ManualContactForm({ onSubmit, isLoading }: ManualContactFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateManualContactRequest>({
    resolver: zodResolver(manualContactSchema),
    defaultValues: {
      visibleToClients: true
    }
  });

  const visibleToClients = watch('visibleToClients');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="John"
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
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          {...register('companyName')}
          placeholder="e.g., Smith & Associates Law Firm"
        />
        {errors.companyName && (
          <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="professionalType">Professional Type *</Label>
        <Select onValueChange={(value) => setValue('professionalType', value as ManualContactType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select professional type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attorney">Attorney</SelectItem>
            <SelectItem value="title_company">Title Company</SelectItem>
            <SelectItem value="inspector">Home Inspector</SelectItem>
            <SelectItem value="appraiser">Appraiser</SelectItem>
            <SelectItem value="insurance">Insurance Agent</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.professionalType && (
          <p className="text-sm text-destructive mt-1">{errors.professionalType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="roleTitle">Role/Title</Label>
        <Input
          id="roleTitle"
          {...register('roleTitle')}
          placeholder="e.g., Closing Attorney, Lead Inspector"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any relevant notes..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="space-y-1">
          <Label htmlFor="visibleToClients">Show in Client Team Showcase</Label>
          <p className="text-sm text-muted-foreground">
            Allow clients to see this contact in their team view
          </p>
        </div>
        <Switch
          id="visibleToClients"
          checked={visibleToClients}
          onCheckedChange={(checked) => setValue('visibleToClients', checked)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Contact...
          </>
        ) : (
          'Add Contact'
        )}
      </Button>
    </form>
  );
}
