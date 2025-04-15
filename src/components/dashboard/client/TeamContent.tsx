
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Star, Phone, Mail } from 'lucide-react';

export const TeamContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Specialists</CardTitle>
        <CardDescription>Professionals helping with your home purchase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mortgage Professional */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Jennifer Williams</h3>
                <p className="text-sm text-muted-foreground">Mortgage Professional</p>
                <p className="text-sm">FirstHome Mortgage</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">4.8/5.0</span>
                </div>
              </div>
            </div>
            <div className="ml-9 space-y-1">
              <a href="tel:+15551234567" className="flex items-center gap-2 text-sm text-blue-600">
                <Phone className="h-3 w-3" />
                <span>(555) 123-4567</span>
              </a>
              <a href="mailto:jwilliams@firsthome.com" className="flex items-center gap-2 text-sm text-blue-600">
                <Mail className="h-3 w-3" />
                <span>jwilliams@firsthome.com</span>
              </a>
            </div>
            <div className="border-t my-3" />
          </div>
          
          {/* Real Estate Agent */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Robert Johnson</h3>
                <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                <p className="text-sm">HomeFind Realty</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">4.9/5.0</span>
                </div>
              </div>
            </div>
            <div className="ml-9 space-y-1">
              <a href="tel:+15552345678" className="flex items-center gap-2 text-sm text-blue-600">
                <Phone className="h-3 w-3" />
                <span>(555) 234-5678</span>
              </a>
              <a href="mailto:rjohnson@homefind.com" className="flex items-center gap-2 text-sm text-blue-600">
                <Mail className="h-3 w-3" />
                <span>rjohnson@homefind.com</span>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
