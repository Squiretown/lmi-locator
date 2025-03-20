
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinIcon, BookmarkIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SavedPropertiesProps {
  onAddressSelect: (address: string) => void;
}

const SavedProperties: React.FC<SavedPropertiesProps> = ({ onAddressSelect }) => {
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load saved addresses from localStorage
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const removeAddress = (addressToRemove: string) => {
    const updatedAddresses = savedAddresses.filter(address => address !== addressToRemove);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    toast.success('Property removed from collection');
  };

  const selectAddress = (address: string) => {
    onAddressSelect(address);
    setIsVisible(false);
  };

  if (savedAddresses.length === 0) {
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
              <CardTitle className="text-base">Saved Properties</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto pb-1">
              <ul className="space-y-2">
                {savedAddresses.map((address) => (
                  <li key={address} className="flex items-center gap-2 group">
                    <Button 
                      variant="ghost" 
                      className="h-auto py-2 px-2 justify-start text-sm font-normal flex-grow text-left"
                      onClick={() => selectAddress(address)}
                    >
                      <MapPinIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                      <span className="truncate">{address}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAddress(address)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SavedProperties;
