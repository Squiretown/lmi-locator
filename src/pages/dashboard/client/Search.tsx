
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, Home, Clock } from "lucide-react";

const ClientSearch: React.FC = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Search</h1>
          <p className="text-muted-foreground">
            Search for properties and check LMI eligibility
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Address Search</CardTitle>
          <CardDescription>
            Enter a property address to check LMI eligibility and assistance programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter property address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Clock className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>
            Your recent property searches and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">123 Main Street, Springfield, IL</h4>
                  <p className="text-sm text-muted-foreground">Searched 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-600">LMI Eligible</Badge>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">456 Oak Avenue, Springfield, IL</h4>
                  <p className="text-sm text-muted-foreground">Searched yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Not Eligible</Badge>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">789 Pine Road, Springfield, IL</h4>
                  <p className="text-sm text-muted-foreground">Searched 3 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-600">LMI Eligible</Badge>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Programs */}
      <Card>
        <CardHeader>
          <CardTitle>Available Assistance Programs</CardTitle>
          <CardDescription>
            Programs you may be eligible for based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Home className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">First-Time Homebuyer Program</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Down payment assistance up to $15,000 for first-time buyers
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-green-600 border-green-600">Eligible</Badge>
                <Button variant="outline" size="sm">Learn More</Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">LMI Assistance Program</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Mortgage insurance assistance for low-to-moderate income buyers
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-green-600 border-green-600">Eligible</Badge>
                <Button variant="outline" size="sm">Learn More</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Search Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Enter complete addresses for the most accurate results</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Use the format: Street Address, City, State</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Check multiple properties in your target area</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Save interesting properties to your favorites</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSearch;
