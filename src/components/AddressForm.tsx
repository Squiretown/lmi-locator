
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { checkLmiStatus } from '@/lib/api';
import { saveSearch } from '@/lib/supabase-api';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'sonner';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await checkLmiStatus(address);
      
      // Save the search to Supabase
      try {
        await saveSearch(address, result);
        // Show toast notification for search saving
        if (result.status === 'success') {
          toast.success('Search saved to history');
        }
      } catch (error) {
        console.warn('Error saving search to Supabase:', error);
        // Continue with the response even if saving fails
      }
      
      onResultReceived(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking LMI status:', error);
      toast.error('Error checking address. Please try again.');
      setIsLoading(false);
    }
  };

  const clearAddress = () => {
    setAddress('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="glass p-5 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label 
            htmlFor="address" 
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Enter an address to check LMI eligibility
          </label>
          <div className="relative">
            <Input
              id="address"
              type="text"
              placeholder="123 Main St, Anytown, ST 12345"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-10 py-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              disabled={isLoading}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {address && (
              <button
                type="button"
                onClick={clearAddress}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <XCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full transition-all"
            disabled={isLoading || !address.trim()}
          >
            {isLoading ? <LoadingSpinner /> : 'Check LMI Status'}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

export default AddressForm;
