
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinIcon, BookmarkIcon, XIcon, CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useSavedAddresses, type SavedAddress } from '@/hooks/useSavedAddresses';
import { useAuth } from '@/hooks/useAuth';

interface SavedPropertiesProps {
  onAddressSelect: (address: string) => void;
}

const SavedProperties: React.FC<SavedPropertiesProps> = ({ onAddressSelect }) => {
  const { savedAddresses, removeAddress, isLoading } = useSavedAddresses();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleRemoveAddress = (id: string) => {
    removeAddress(id);
  };

  const selectAddress = (address: string) => {
    onAddressSelect(address);
    setIsVisible(false);
  };

  if (savedAddresses.length === 0 && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        onClick={toggleVisibility}
        className="rounded-full shadow-lg h-12 w-12 p-0 relative"
        variant="default"
      >
        <BookmarkIcon className="h-5 w-5" />
        <span className="absolute -top-2 -right-2 bg-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {savedAddresses.length}
        </span>
      </Button>

      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-16 right-0 w-72"
        >
          <Card className="shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <span>Saved Properties</span>
                {user ? (
                  <span className="text-xs text-muted-foreground">Synced to your account</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Saved locally</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto pb-1">
              {isLoading ? (
                <div className="py-4 text-center text-muted-foreground">Loading saved properties...</div>
              ) : (
                <ul className="space-y-2">
                  {savedAddresses.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 group">
                      <Button 
                        variant="ghost" 
                        className="h-auto py-2 px-2 justify-start text-sm font-normal flex-grow text-left"
                        onClick={() => selectAddress(item.address)}
                      >
                        <div className="flex items-start">
                          <MapPinIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="truncate block">{item.address}</span>
                            {item.isLmiEligible && (
                              <span className="text-xs text-green-600 flex items-center mt-0.5">
                                <CheckCircleIcon className="h-3 w-3 mr-1" /> LMI Eligible
                              </span>
                            )}
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveAddress(item.id)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SavedProperties;
