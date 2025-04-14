
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, MapPin, Calendar, Clock, User, Phone, Star, CheckCircle, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PropertyChecker from '@/components/PropertyChecker';
import SavedProperties from '@/components/SavedProperties';
import { ClientDashboardContent } from '@/components/dashboard/client/ClientDashboardContent';

const ClientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showPropertyChecker, setShowPropertyChecker] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleAddressSelect = (address: string) => {
    // Extract address components
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      // Handle address selection
      setShowPropertyChecker(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Home Buying Dashboard</h1>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>
      
      <Tabs defaultValue="dashboard" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="journey">Journey Tracker</TabsTrigger>
          <TabsTrigger value="team">Your Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <ClientDashboardContent />
        </TabsContent>
        
        <TabsContent value="journey">
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
        </TabsContent>
        
        <TabsContent value="team">
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
        </TabsContent>
      </Tabs>
      
      <SavedProperties onAddressSelect={handleAddressSelect} />
    </div>
  );
};

export default ClientDashboard;
