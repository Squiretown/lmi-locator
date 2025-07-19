import React, { useState } from 'react';
import { MessageSquare, Users, FileText, Send, Calendar, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComposeMessage } from './ComposeMessage';
import { MessageTemplates } from './MessageTemplates';
import { MessageHistory } from './MessageHistory';
import { BulkMessaging } from './BulkMessaging';
import { ScheduledMessages } from './ScheduledMessages';

export function AdminMessagingDashboard() {
  const [activeTab, setActiveTab] = useState('compose');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Messaging Center</h1>
        <p className="text-muted-foreground">
          Send notifications and messages to users, manage templates, and track delivery.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Send
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Compose Message
              </CardTitle>
              <CardDescription>
                Send a notification to individual users or groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComposeMessage />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Messaging
              </CardTitle>
              <CardDescription>
                Send messages to multiple users based on criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkMessaging />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Message Templates
              </CardTitle>
              <CardDescription>
                Manage reusable message templates for common communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Message History
              </CardTitle>
              <CardDescription>
                View sent messages and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Messages
              </CardTitle>
              <CardDescription>
                View and manage scheduled notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduledMessages />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}