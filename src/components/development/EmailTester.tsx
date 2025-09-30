import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCcwIcon, MailIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import StatusBadge from './StatusBadge';
import { getValidSession } from '@/lib/auth/getValidSession';
interface EmailTestResult {
  success: boolean;
  error?: string;
  messageId?: string;
  responseTime: number;
}

const EmailTester: React.FC = () => {
  const [emailType, setEmailType] = useState<'client-invitation' | 'admin-message'>('client-invitation');
  const [testData, setTestData] = useState({
    email: '',
    name: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<EmailTestResult | null>(null);
  const [configStatus, setConfigStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testEmailConfig = async () => {
    setConfigStatus('testing');
    const startTime = performance.now();
    
    try {
      // Test basic email configuration by sending a test email
      // Function 'send-user-email' does not exist
      const error = new Error('Function not implemented');
      const data = null;

      const responseTime = Math.round(performance.now() - startTime);

      if (error) {
        setConfigStatus('error');
        toast.error(`Email config test failed: ${error.message}`);
      } else {
        setConfigStatus('success');
        toast.success('Email configuration is working');
      }
    } catch (error: any) {
      setConfigStatus('error');
      toast.error(`Email config test failed: ${error.message}`);
    }
  };

  const sendTestEmail = async () => {
    if (!testData.email || !testData.name) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      let result;
      
      if (emailType === 'client-invitation') {
        await getValidSession();
        result = await supabase.functions.invoke('send-user-invitation', {
          body: {
            email: testData.email,
            userType: 'client',
            firstName: testData.name.split(' ')[0] || 'Test',
            lastName: testData.name.split(' ').slice(1).join(' ') || 'User',
            phone: testData.phone,
            sendVia: 'email',
            customMessage: 'This is a test invitation'
          }
        });
      } else {
        // Function 'send-user-email' does not exist
        result = { error: new Error('Function not implemented'), data: null };
      }

      const responseTime = Math.round(performance.now() - startTime);

      if (result.error) {
        setLastResult({
          success: false,
          error: result.error.message,
          responseTime
        });
        toast.error(`Email test failed: ${result.error.message}`);
      } else {
        setLastResult({
          success: true,
          messageId: result.data?.messageId,
          responseTime
        });
        toast.success('Test email sent successfully!');
      }
    } catch (error: any) {
      const responseTime = Math.round(performance.now() - startTime);
      setLastResult({
        success: false,
        error: error.message,
        responseTime
      });
      toast.error(`Email test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MailIcon className="h-5 w-5" />
          Email Testing
        </CardTitle>
        <CardDescription>
          Test email sending functionality and configuration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email Configuration Test */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Email Configuration Status:</Label>
            <StatusBadge 
              status={configStatus}
              idleText="Not Tested"
              testingText="Testing..."
              successText="Configured"
              errorText="Error"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={testEmailConfig}
            disabled={configStatus === 'testing'}
            className="w-full"
          >
            {configStatus === 'testing' ? (
              <RefreshCcwIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MailIcon className="mr-2 h-4 w-4" />
            )}
            Test Email Configuration
          </Button>
        </div>

        {/* Email Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="email-type">Email Type</Label>
          <Select value={emailType} onValueChange={(value: any) => setEmailType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client-invitation">Client Invitation</SelectItem>
              <SelectItem value="admin-message">Admin Message</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Data Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email *</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testData.email}
                onChange={(e) => setTestData({ ...testData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name *</Label>
              <Input
                id="test-name"
                placeholder="Test User"
                value={testData.name}
                onChange={(e) => setTestData({ ...testData, name: e.target.value })}
              />
            </div>
          </div>

          {emailType === 'client-invitation' && (
            <div className="space-y-2">
              <Label htmlFor="test-phone">Phone (Optional)</Label>
              <Input
                id="test-phone"
                placeholder="+1234567890"
                value={testData.phone}
                onChange={(e) => setTestData({ ...testData, phone: e.target.value })}
              />
            </div>
          )}

          {emailType === 'admin-message' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="test-subject">Subject</Label>
                <Input
                  id="test-subject"
                  placeholder="Test Subject"
                  value={testData.subject}
                  onChange={(e) => setTestData({ ...testData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-message">Message</Label>
                <Textarea
                  id="test-message"
                  placeholder="Test message content..."
                  value={testData.message}
                  onChange={(e) => setTestData({ ...testData, message: e.target.value })}
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        {/* Send Test Button */}
        <Button 
          onClick={sendTestEmail}
          disabled={isLoading || !testData.email || !testData.name}
          className="w-full"
        >
          {isLoading ? (
            <RefreshCcwIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="mr-2 h-4 w-4" />
          )}
          Send Test Email
        </Button>

        {/* Test Results */}
        {lastResult && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="font-medium mb-2">Last Test Result:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <StatusBadge 
                  status={lastResult.success ? 'success' : 'error'}
                  successText="Sent"
                  errorText="Failed"
                />
              </div>
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span>{lastResult.responseTime}ms</span>
              </div>
              {lastResult.messageId && (
                <div className="flex justify-between">
                  <span>Message ID:</span>
                  <span className="font-mono text-xs">{lastResult.messageId}</span>
                </div>
              )}
              {lastResult.error && (
                <div className="text-destructive">
                  <span className="font-medium">Error:</span> {lastResult.error}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTester;