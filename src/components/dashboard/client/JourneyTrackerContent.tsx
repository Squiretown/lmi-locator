
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle } from 'lucide-react';

export const JourneyTrackerContent: React.FC = () => {
  return (
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
  );
};
