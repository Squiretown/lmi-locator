
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Phone, Mail } from 'lucide-react';
import { useAssignedProfessionals } from '@/hooks/useAssignedProfessionals';
import { Skeleton } from '@/components/ui/skeleton';

export const TeamContent: React.FC = () => {
  const { data: professionals, isLoading } = useAssignedProfessionals();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Specialists</CardTitle>
          <CardDescription>Professionals helping with your home purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Specialists</CardTitle>
        <CardDescription>Professionals helping with your home purchase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {professionals?.map((professional) => (
            <div key={professional.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{professional.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {professional.type === 'mortgage_broker' ? 'Mortgage Professional' : 'Real Estate Agent'}
                  </p>
                  <p className="text-sm">{professional.company}</p>
                </div>
              </div>
              <div className="ml-9 space-y-1">
                {professional.phone && (
                  <a href={`tel:${professional.phone}`} className="flex items-center gap-2 text-sm text-blue-600">
                    <Phone className="h-3 w-3" />
                    <span>{professional.phone}</span>
                  </a>
                )}
                {professional.website && (
                  <a href={professional.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600">
                    <Mail className="h-3 w-3" />
                    <span>{professional.website}</span>
                  </a>
                )}
              </div>
              {professional !== professionals[professionals.length - 1] && (
                <div className="border-t my-3" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
