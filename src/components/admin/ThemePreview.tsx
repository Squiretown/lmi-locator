import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Eye } from 'lucide-react';

export const ThemePreview: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
          <Badge variant="secondary">Theme Preview</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Sample Card Title</CardTitle>
            <CardDescription>
              This is how your content will look with the current theme colors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="destructive" size="sm">
                Delete
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
              <Button variant="link" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Favorite
              </Button>
            </div>
            
            <div className="p-3 border rounded bg-muted">
              <p className="text-muted-foreground text-sm">
                This is muted content that shows how secondary text appears.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Eye className="w-4 h-4 text-accent-foreground" />
              <span className="text-foreground">Regular text content</span>
              <Badge variant="outline">Status</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};