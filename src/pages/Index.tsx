
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import AddressForm from '@/components/AddressForm';
import Result from '@/components/Result';
import ResultsMap from '@/components/ResultsMap';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from 'lucide-react';

interface LmiResult {
  address: string;
  lat: number;
  lon: number;
  tract_id: string;
  median_income: number;
  ami: number;
  income_category: string;
  percentage_of_ami: number;
  eligibility: string;
  is_approved: boolean;
  approval_message: string;
  lmi_status: string;
}

const Index = () => {
  const [result, setResult] = useState<LmiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleResultReceived = (data: LmiResult) => {
    setResult(data);
  };

  const resetSearch = () => {
    setResult(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle scroll event to show/hide the scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pb-16">
        <AddressForm 
          onResultReceived={handleResultReceived} 
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        
        <AnimatePresence>
          {result && (
            <>
              <motion.div 
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12"
              >
                <Result data={result} />
              </motion.div>
              
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultsMap 
                  lat={result.lat} 
                  lon={result.lon}
                  isEligible={result.is_approved}
                />
              </motion.div>
              
              <motion.div
                key="new-search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mt-10"
              >
                <Button onClick={resetSearch} variant="outline">
                  Check Another Address
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
      
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="rounded-full shadow-lg"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <ArrowUpIcon className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
