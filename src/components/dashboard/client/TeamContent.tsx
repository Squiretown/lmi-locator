
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
          {[
            {
              name: 'Jennifer Williams',
              role: 'Mortgage Professional',
              company: 'FirstHome Mortgage',
              phone: '(555) 123-4567',
              email: 'jwilliams@firsthome.com',
              rating: 4.8
            },
            {
              name: 'Robert Johnson',
              role: 'Real Estate Agent',
              company: 'HomeFind Realty',
              phone: '(555) 234-5678',
              email: 'rjohnson@homefind.com',
              rating: 4.9
            }
          ].map((specialist, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{specialist.name}</h3>
                  <p className="text-sm text-muted-foreground">{specialist.role}</p>
                  <p className="text-sm">{specialist.company}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm">{specialist.rating}/5.0</span>
                  </div>
                </div>
              </div>
              <div className="ml-9 space-y-1">
                <a href={`tel:${specialist.phone}`} className="flex items-center gap-2 text-sm text-blue-600">
                  <Phone className="h-3 w-3" />
                  <span>{specialist.phone}</span>
                </a>
                <a href={`mailto:${specialist.email}`} className="flex items-center gap-2 text-sm text-blue-600">
                  <Mail className="h-3 w-3" />
                  <span>{specialist.email}</span>
                </a>
              </div>
              {i < 1 && <div className="border-t my-3" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
