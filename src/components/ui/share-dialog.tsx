import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  isApproved: boolean;
  tractId?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  address,
  isApproved,
  tractId
}) => {
  const [email, setEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-property-results', {
        body: {
          recipientEmail: email.trim(),
          address,
          isApproved,
          tractId,
          senderName: senderName.trim() || undefined
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Property results shared successfully!', {
        description: `Results sent to ${email}`
      });

      // Reset form and close dialog
      setEmail('');
      setSenderName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email', {
        description: 'Please check the email address and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const subject = encodeURIComponent('LMI Property Check Results');
    const body = encodeURIComponent(`Property LMI Status Check Results:

Address: ${address}
Status: ${isApproved ? 'LMI Eligible' : 'Not in LMI Area'}
Census Tract: ${tractId || 'Unknown'}

This property was checked for Low-to-Moderate Income (LMI) eligibility.`);
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    // Copy the formatted text to clipboard
    const textToCopy = `Property LMI Status Check Results:

Address: ${address}
Status: ${isApproved ? 'LMI Eligible' : 'Not in LMI Area'}
Census Tract: ${tractId || 'Unknown'}

This property was checked for Low-to-Moderate Income (LMI) eligibility.`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Results copied to clipboard');
    }).catch(() => {
      // Fallback to mailto if clipboard fails
      window.open(mailtoLink);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Property Results
          </DialogTitle>
          <DialogDescription>
            Send the LMI status results for this property via email
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sender-name">Your Name (Optional)</Label>
            <Input
              id="sender-name"
              type="text"
              placeholder="Enter your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="font-medium mb-1">Preview:</div>
            <div className="text-muted-foreground space-y-1">
              <div><strong>Address:</strong> {address}</div>
              <div><strong>Status:</strong> <span className={isApproved ? 'text-green-600' : 'text-red-600'}>
                {isApproved ? 'LMI Eligible' : 'Not in LMI Area'}
              </span></div>
              {tractId && <div><strong>Census Tract:</strong> {tractId}</div>}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSendEmail} 
              className="flex-1" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCopyLink}
              disabled={isLoading}
            >
              Copy Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};