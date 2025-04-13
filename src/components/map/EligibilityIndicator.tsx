
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface EligibilityIndicatorProps {
  isEligible: boolean;
}

const EligibilityIndicator: React.FC<EligibilityIndicatorProps> = ({ isEligible }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center p-4 rounded-lg shadow-lg
                 ${isEligible ? 'bg-green-100 border-2 border-green-600' : 'bg-red-100 border-2 border-red-600'}`}
    >
      <div className="flex items-center space-x-3">
        {isEligible ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
        <div>
          <p className={`font-semibold ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
            {isEligible ? 'LMI Eligible Area' : 'Not an LMI Area'}
          </p>
          <p className="text-sm text-gray-600">
            {isEligible 
              ? 'This property is in a Low-to-Moderate Income census tract' 
              : 'This property is not in a Low-to-Moderate Income census tract'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EligibilityIndicator;
