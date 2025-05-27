
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const MarketingSection: React.FC = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleCreateList = () => {
    setShowComingSoon(true);
    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowComingSoon(false);
    }, 3000);
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
            Find homes located in LMI Tracks
          </p>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
