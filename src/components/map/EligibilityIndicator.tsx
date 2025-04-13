
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EligibilityIndicatorProps {
  isEligible: boolean;
  onGetMoreInfo: () => void;
}

const EligibilityIndicator: React.FC<EligibilityIndicatorProps> = ({ 
  isEligible, 
  onGetMoreInfo 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none`}
    >
      <div 
        className={`max-w-md w-full p-6 rounded-lg shadow-lg pointer-events-auto
                   ${isEligible ? 'bg-green-100 border-2 border-green-600' : 'bg-red-100 border-2 border-red-600'}`}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white">
            {isEligible ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
              {isEligible ? 'LMI Eligible Area' : 'Not an LMI Area'}
            </h3>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              {isEligible 
                ? 'This property is in a Low-to-Moderate Income census tract' 
                : 'This property is not in a Low-to-Moderate Income census tract'}
            </p>
          </div>
          <Button 
            onClick={onGetMoreInfo}
            className="flex items-center gap-2"
          >
            <InfoIcon className="h-4 w-4" />
            Get More Info
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EligibilityIndicator;
