
import React from 'react';
import { motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import MapDisplay from './MapDisplay';
import MapStatus from './MapStatus';
import TractInfoPanel from './TractInfoPanel';

interface MapProps {
  lat: number;
  lon: number;
  isEligible: boolean;
  tractId?: string;
}

const ResultsMap: React.FC<MapProps> = ({ lat, lon, isEligible, tractId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full mt-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg overflow-hidden border shadow-lg bg-card">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-medium">Census Tract Map</h2>
            <div className="flex items-center text-xs text-muted-foreground">
              <InfoIcon className="h-3.5 w-3.5 mr-1" />
              <span>Data from U.S. Census Bureau ACS 5-Year Estimates</span>
            </div>
          </div>
          
          <MapDisplay 
            lat={lat} 
            lon={lon} 
            isEligible={isEligible} 
            tractId={tractId} 
          />
          
          <TractInfoPanel 
            isEligible={isEligible}
            tractId={tractId}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsMap;
