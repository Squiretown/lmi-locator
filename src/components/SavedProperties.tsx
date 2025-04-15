
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, X, CheckCircle, Calendar } from 'lucide-react';
import { useSavedAddresses, type SavedAddress } from '@/hooks/useSavedAddresses';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

interface SavedPropertiesProps {
  onAddressSelect: (address: string) => void;
}

const SavedProperties: React.FC<SavedPropertiesProps> = ({ onAddressSelect }) => {
  const { savedAddresses, removeAddress, isLoading, refreshAddresses } = useSavedAddresses();
  const { user } = useAuth();

  useEffect(() => {
    refreshAddresses();
  }, []);

  const handleRemoveAddress = (id: string) => {
    removeAddress(id);
  };

  const selectAddress = (address: string) => {
    onAddressSelect(address);
  };

  if (savedAddresses.length === 0 && !isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Your Saved Properties</span>
            <Badge variant="outline" className="ml-2 text-xs">0 Saved</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No properties saved yet</p>
          <p className="text-sm mt-2">Properties you've checked for eligibility will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Your Saved Properties</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {savedAddresses.length} Saved
            </Badge>
            {savedAddresses.filter(a => a.isLmiEligible).length > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                {savedAddresses.filter(a => a.isLmiEligible).length} LMI Eligible
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">Loading saved properties...</div>
        ) : (
          <ul className="space-y-4">
            {savedAddresses.map((item) => (
              <li key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${item.isLmiEligible ? 'bg-green-100' : 'bg-red-100'}`}>
                      <MapPin className={`h-4 w-4 ${item.isLmiEligible ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 justify-start text-sm font-medium text-left hover:no-underline"
                        onClick={() => selectAddress(item.address)}
                      >
                        {item.address}
                      </Button>
                      <div className="flex items-center mt-1">
                        {item.isLmiEligible ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" /> LMI Eligible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                            Not Eligible
                          </Badge>
                        )}
                        
                        <div className="text-xs text-muted-foreground ml-3 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-1"
                    onClick={() => handleRemoveAddress(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" className="w-full">
            Check Another Property
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedProperties;
