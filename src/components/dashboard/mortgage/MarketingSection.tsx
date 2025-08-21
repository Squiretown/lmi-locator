
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailPreferencesDialog, EmailPreferences } from './EmailPreferencesDialog';
import { useUnifiedClientInvitations } from '@/hooks/useUnifiedClientInvitations';

export const MarketingSection: React.FC = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { createInvitation } = useUnifiedClientInvitations();

  const handleCreateList = () => {
    setShowComingSoon(true);
    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowComingSoon(false);
    }, 3000);
  };

  const handleSendEmail = async (preferences: EmailPreferences) => {
    const { emailProgram, subject, message, recipientEmail } = preferences;
    
    // Track the invitation if recipient email is provided
    if (recipientEmail) {
      try {
        await createInvitation({
          email: recipientEmail,
          name: recipientEmail.split('@')[0], // Use email prefix as name fallback
          invitationType: 'email'
        });
      } catch (error) {
        console.error('Failed to track invitation:', error);
        // Continue with email sending even if tracking fails
      }
    }
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(message);
    const toEmail = recipientEmail ? encodeURIComponent(recipientEmail) : '';

    let emailUrl = '';

    switch (emailProgram) {
      case 'gmail':
        emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEmail}&su=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'outlook':
        emailUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${toEmail}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'yahoo':
        emailUrl = `https://compose.mail.yahoo.com/?to=${toEmail}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      default:
        emailUrl = `mailto:${toEmail}?subject=${encodedSubject}&body=${encodedBody}`;
        break;
    }

    if (emailProgram === 'default') {
      window.location.href = emailUrl;
    } else {
      window.open(emailUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Marketing List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Find homes located in LMI Tracks
          </p>
          
          {showComingSoon && (
            <Alert className="mb-4">
              <AlertDescription>
                🚀 Coming Soon! This feature is currently under development.
              </AlertDescription>
            </Alert>
          )}
          
          <Button variant="outline" className="gap-2" onClick={handleCreateList}>
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Send clients a link to check LMI property eligibility
          </p>
          <EmailPreferencesDialog onSendEmail={handleSendEmail} />
        </CardContent>
      </Card>
    </div>
  );
};
