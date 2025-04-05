
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, MapPin, Calendar, Clock, User, Phone, Star, CheckCircle, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PropertyChecker from '@/components/PropertyChecker';

const ClientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showPropertyChecker, setShowPropertyChecker] = useState(false);
  
  // Mock saved properties
  const savedProperties = [
    { 
      address: '123 Main St, Anytown, CA 92101', 
      lmiStatus: true, 
      programs: 3,
      dateChecked: '2024-03-15'
    },
    { 
      address: '456 Oak Ave, Somewhere, CA 90210', 
      lmiStatus: false, 
      programs: 0,
      dateChecked: '2024-03-10'
    },
    { 
      address: '789 Elm Blvd, Elsewhere, CA 95814', 
      lmiStatus: true, 
      programs: 5,
      dateChecked: '2024-03-05'
    },
  ];
  
  // Mock assigned specialists
  const specialists = [
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
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Home Buying Dashboard</h1>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>
      
      {showPropertyChecker ? (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Check Property Eligibility</h2>
            <Button variant="ghost" onClick={() => setShowPropertyChecker(false)}>
              Close
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <PropertyChecker />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">Check If A Property Is Eligible</h2>
                  <p className="text-muted-foreground mb-4">
                    Find out if a property is in an LMI area and discover available assistance programs
                  </p>
                </div>
                <Button onClick={() => setShowPropertyChecker(true)}>Check Property</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Saved Properties</CardTitle>
            <CardDescription>Properties you've checked for eligibility</CardDescription>
          </CardHeader>
          <CardContent>
            {savedProperties.length > 0 ? (
              <div className="space-y-4">
                {savedProperties.map((property, i) => (
                  <div key={i} className="border rounded-md p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-md ${property.lmiStatus ? 'bg-green-100' : 'bg-red-100'}`}>
                          <Home className={`h-5 w-5 ${property.lmiStatus ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{property.address}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Census Tract: 0341.05</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={property.lmiStatus ? 'secondary' : 'destructive'} className={property.lmiStatus ? 'bg-green-600 text-white' : ''}>
                        {property.lmiStatus ? 'LMI Eligible' : 'Not Eligible'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{property.lmiStatus ? `${property.programs} Programs Available` : 'No Programs Available'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Checked on {property.dateChecked}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No saved properties yet</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowPropertyChecker(true)}>
                  Check Your First Property
                </Button>
              </div>
            )}
          </CardContent>
          {savedProperties.length > 0 && (
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => setShowPropertyChecker(true)}>
                Check Another Property
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Specialists</CardTitle>
            <CardDescription>Professionals helping with your home purchase</CardDescription>
          </CardHeader>
          <CardContent>
            {specialists.length > 0 ? (
              <div className="space-y-6">
                {specialists.map((specialist, i) => (
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
                    {i < specialists.length - 1 && <div className="border-t my-3" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No specialists assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Home Buying Journey</CardTitle>
          <CardDescription>Track your progress through the home buying process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
            {[
              { 
                title: 'Getting Pre-Approved', 
                date: 'Completed on March 1, 2025', 
                description: 'You\'ve been pre-approved for a mortgage of $350,000',
                status: 'completed'
              },
              { 
                title: 'Finding Properties', 
                date: 'In Progress', 
                description: 'You\'ve saved 3 properties that match your criteria',
                status: 'current'
              },
              { 
                title: 'Making an Offer', 
                date: 'Not Started', 
                description: 'Work with your real estate agent to make an offer on a property',
                status: 'upcoming'
              },
              { 
                title: 'Home Inspection', 
                date: 'Not Started', 
                description: 'Get a professional inspection of your chosen property',
                status: 'upcoming'
              },
              { 
                title: 'Final Approval & Closing', 
                date: 'Not Started', 
                description: 'Complete paperwork and close on your new home',
                status: 'upcoming'
              },
            ].map((step, i) => (
              <div key={i} className="relative pl-10 pb-8">
                <div className={`absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border ${
                  step.status === 'completed' ? 'bg-green-100 border-green-600' :
                  step.status === 'current' ? 'bg-blue-100 border-blue-600' :
                  'bg-muted border-muted-foreground/20'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className={`h-2 w-2 rounded-full ${
                      step.status === 'current' ? 'bg-blue-600' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className={`text-sm ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'current' ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`}>
                    {step.status === 'current' && <Clock className="inline h-3 w-3 mr-1" />}
                    {step.date}
                  </p>
                  <p className="text-sm mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
