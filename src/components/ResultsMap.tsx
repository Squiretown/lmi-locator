
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';

interface MapProps {
  lat: number;
  lon: number;
  isEligible: boolean;
}

// This is a placeholder map component
// In a real implementation, we would integrate with a mapping library
const ResultsMap: React.FC<MapProps> = ({ lat, lon, isEligible }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Here we would initialize the map
    console.log('Map should initialize with:', { lat, lon, isEligible });
    
    // Simulate map with a placeholder
    if (mapRef.current) {
      const ctx = document.createElement('canvas').getContext('2d');
      if (ctx) {
        const mapImg = document.createElement('img');
        mapImg.src = `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${lon},${lat},13,0/800x500@2x?access_token=pk.placeholder`;
        mapImg.alt = 'Map displaying the location';
        mapImg.className = 'w-full h-full object-cover';
        
        // Clear previous children
        while (mapRef.current.firstChild) {
          mapRef.current.removeChild(mapRef.current.firstChild);
        }
        
        mapRef.current.appendChild(mapImg);
      }
    }
    
    // Cleanup function for real map implementation would go here
    return () => {
      console.log('Map cleanup');
    };
  }, [lat, lon, isEligible]);
  
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
          
          <div 
            ref={mapRef} 
            className="w-full h-[350px] md:h-[450px] bg-secondary/50 flex items-center justify-center"
          >
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-2">
                Map would display census tract boundaries and location marker.
              </p>
              <p className="text-sm text-muted-foreground">
                Coordinates: {lat.toFixed(6)}, {lon.toFixed(6)}
              </p>
            </div>
          </div>
          
          <div className="p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isEligible ? 'bg-eligible' : 'bg-ineligible'}`}></div>
              <span>
                {isEligible ? 'LMI Eligible' : 'Not LMI Eligible'} Census Tract
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsMap;
