
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Trash2, RotateCcw, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SavedPropertiesProps {
  onAddressSelect: (address: string) => void;
}

export const SavedProperties: React.FC<SavedPropertiesProps> = ({ onAddressSelect }) => {
  const { savedAddresses, isLoading, removeAddress, refreshAddresses } = useSavedAddresses();
  const { user } = useAuth();

  console.log('SavedProperties render:', { 
    addressCount: savedAddresses.length, 
    isLoading, 
    hasUser: !!user 
  });

  useEffect(() => {
    console.log('SavedProperties useEffect - refreshing addresses');
    refreshAddresses();
  }, [user, refreshAddresses]);

  // Listen for property-saved events to refresh the list
  useEffect(() => {
    const handlePropertySaved = () => {
      console.log('Property saved event received, refreshing addresses');
      refreshAddresses();
    };

    window.addEventListener('property-saved', handlePropertySaved);
    return () => {
      window.removeEventListener('property-saved', handlePropertySaved);
    };
  }, [refreshAddresses]);

  const handleRemoveAddress = async (id: string) => {
    console.log('Removing address with id:', id);
    const success = await removeAddress(id);
    if (success) {
      toast.success('Property removed from saved list');
    } else {
      toast.error('Failed to remove property');
    }
  };

  const selectAddress = (address: string) => {
    console.log('Address selected:', address);
    onAddressSelect(address);
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await refreshAddresses();
    toast.success('Saved properties refreshed');
  };

  const lmiEligibleCount = savedAddresses.filter(addr => addr.isLmiEligible).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedAddresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Saved Properties
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties saved yet</h3>
            <p className="text-muted-foreground mb-4">
              Save properties from your LMI status checks to view them here
            </p>
            <Button onClick={() => onAddressSelect('')} className="gap-2">
              <Plus className="w-4 h-4" />
              Check Another Property
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Saved Properties ({savedAddresses.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          {lmiEligibleCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {lmiEligibleCount} of {savedAddresses.length} properties are LMI eligible
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {savedAddresses.map((savedAddress) => (
            <div
              key={savedAddress.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <button
                  onClick={() => selectAddress(savedAddress.address)}
                  className="text-left w-full group"
                >
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {savedAddress.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={savedAddress.isLmiEligible ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {savedAddress.isLmiEligible ? 'LMI Eligible' : 'Not LMI Eligible'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Saved {formatDistanceToNow(new Date(savedAddress.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAddress(savedAddress.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => onAddressSelect('')} className="gap-2">
          <Plus className="w-4 h-4" />
          Check Another Property
        </Button>
      </div>
    </div>
  );
};

export default SavedProperties;
