
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, XCircleIcon, BookmarkIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { saveSearch } from '@/lib/supabase/index';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'sonner';
import { z } from 'zod';
import { formSchema } from '@/hooks/usePropertySearch';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';

interface AddressFormProps {
  onResultReceived: (result: any) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  onResultReceived, 
  setIsLoading,
  isLoading 
}) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const { savedAddresses, saveAddress } = useSavedAddresses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = {
        address,
        city,
        state,
        zipCode
      };
      
      formSchema.parse(formData);
      
      setIsLoading(true);
      
      onResultReceived(formData);
      
      try {
        const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
        const result = await saveSearch(fullAddress, null);
        
        if (!result.success) {
          console.warn('Error saving search:', result.error);
        } else {
          toast.success('Search saved to history');
        }
      } catch (error) {
        console.warn('Error saving search to Supabase:', error);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        const errorMessages = Object.values(fieldErrors).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error('Please fill in all required fields');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProperty = () => {
    if (!address.trim()) {
      return;
    }
    
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    saveAddress(fullAddress);
  };

  const clearForm = () => {
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
  };

  const isAddressSaved = savedAddresses.some(item => {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    return item.address === fullAddress;
  });
  
  const isFormComplete = address.trim() && city.trim() && state.trim() && zipCode.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="glass p-5 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">Enter an address to check LMI eligibility</h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-foreground/80 mb-1">
                Street Address
              </label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-foreground/80 mb-1">
                  City
                </label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Anytown"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-foreground/80 mb-1">
                    State
                  </label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="NY"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-foreground/80 mb-1">
                    ZIP
                  </label>
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="12345"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/[^0-9-]/g, ''))}
                    maxLength={10}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 transition-all"
              disabled={isLoading || !isFormComplete}
            >
              {isLoading ? <LoadingSpinner /> : 'Check LMI Status'}
            </Button>
            
            {address.trim() && (
              <Button
                type="button"
                variant="ghost"
                className="px-3 transition-all"
                onClick={clearForm}
                disabled={isLoading}
                title="Clear form"
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            )}
            
            {isFormComplete && (
              <Button
                type="button"
                variant={isAddressSaved ? "secondary" : "outline"}
                className={`px-3 transition-all ${isAddressSaved ? 'bg-primary/10 text-primary' : ''}`}
                onClick={handleSaveProperty}
                disabled={isLoading || isAddressSaved}
                title={isAddressSaved ? "Property already saved" : "Save property"}
              >
                {isAddressSaved ? <CheckIcon className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default AddressForm;
