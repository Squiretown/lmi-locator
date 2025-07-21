
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  supportEmail: string;
  businessHours: string;
}

interface ContactInfoSectionProps {
  contactInfo: ContactInfo;
  onContactInfoChange: (key: string, value: string) => void;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  contactInfo,
  onContactInfoChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="email">Main Email</Label>
            <Input
              id="email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => onContactInfoChange('email', e.target.value)}
              placeholder="info@lmicheck.com"
            />
          </div>
          <div>
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={contactInfo.supportEmail}
              onChange={(e) => onContactInfoChange('supportEmail', e.target.value)}
              placeholder="support@lmicheck.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => onContactInfoChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={contactInfo.address}
              onChange={(e) => onContactInfoChange('address', e.target.value)}
              placeholder="Suffolk, NY"
            />
          </div>
          <div>
            <Label htmlFor="businessHours">Business Hours</Label>
            <Textarea
              id="businessHours"
              value={contactInfo.businessHours}
              onChange={(e) => onContactInfoChange('businessHours', e.target.value)}
              placeholder="Monday - Friday: 9:00 AM - 5:00 PM EST"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
