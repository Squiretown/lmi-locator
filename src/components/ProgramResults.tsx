
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssistanceProgram, ProgramResultsProps } from '@/lib/types';

const ProgramResults: React.FC<ProgramResultsProps> = ({ programs, address, onConnectSpecialist }) => {
  if (!programs || programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Programs Found</CardTitle>
          <CardDescription>We couldn't find any assistance programs for {address}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Try searching a different address or contact a housing specialist for personalized assistance.</p>
        </CardContent>
        <CardFooter>
          {onConnectSpecialist && (
            <Button onClick={onConnectSpecialist}>Connect with a Specialist</Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Available Programs for {address}</h2>
      <p className="text-gray-500">
        We found {programs.length} program{programs.length !== 1 ? 's' : ''} that may be available for this address.
      </p>
      
      <div className="space-y-4">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{program.name}</CardTitle>
                  <CardDescription>
                    {program.funding_source && <span>Funded by: {program.funding_source}</span>}
                  </CardDescription>
                </div>
                <Badge variant="outline">{program.benefit_type || 'Assistance Program'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>{program.description}</p>
                
                {program.benefit_amount && (
                  <div>
                    <p className="font-semibold">Benefit Amount:</p>
                    <p>${program.benefit_amount.toLocaleString()}</p>
                  </div>
                )}
                
                {program.program_locations && program.program_locations.length > 0 && (
                  <div>
                    <p className="font-semibold">Available in:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {program.program_locations.map((location) => (
                        <Badge key={location.id} variant="secondary">
                          {location.location_value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {program.property_types_eligible && program.property_types_eligible.length > 0 && (
                  <div>
                    <p className="font-semibold">Eligible Property Types:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {program.property_types_eligible.map((property) => (
                        <Badge key={property.id} variant="outline">
                          {property.property_type}
                          {property.max_units && ` (up to ${property.max_units} units)`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-semibold">Requirements:</p>
                    <ul className="list-disc list-inside">
                      {program.income_limit_percentage && (
                        <li>Income limit: {program.income_limit_percentage}% of AMI</li>
                      )}
                      {program.min_credit_score && (
                        <li>Minimum credit score: {program.min_credit_score}</li>
                      )}
                      {program.first_time_buyer_required && (
                        <li>First-time homebuyer required</li>
                      )}
                      {program.military_status_required && (
                        <li>Military status: {program.military_status_required}</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Contact Information:</p>
                    {program.contact_info && (
                      <div className="space-y-1">
                        {program.contact_info.name && <p>{program.contact_info.name}</p>}
                        {program.contact_info.phone && <p>Phone: {program.contact_info.phone}</p>}
                        {program.contact_info.email && <p>Email: {program.contact_info.email}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {program.application_url && (
                <Button asChild>
                  <a href={program.application_url} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                </Button>
              )}
              
              {onConnectSpecialist && (
                <Button variant="outline" onClick={onConnectSpecialist}>
                  Speak with a Specialist
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgramResults;
