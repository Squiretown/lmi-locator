import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyInvitationCodeProps {
  invitationCode: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const CopyInvitationCode: React.FC<CopyInvitationCodeProps> = ({
  invitationCode,
  variant = 'outline',
  size = 'sm'
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const invitationUrl = `${window.location.origin}/accept-invitation/${invitationCode}`;
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      toast.success('Invitation link copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invitation code:', err);
      toast.error('Failed to copy invitation link');
    }
  };

  return (
    <Button
      onClick={copyToClipboard}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy Link
        </>
      )}
    </Button>
  );
};