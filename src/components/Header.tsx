
import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <motion.header 
      className="relative z-10 pt-12 pb-6 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            className="flex items-center gap-2 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="bg-primary/10 p-3 rounded-xl">
              <MapPinIcon className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Census LMI Finder
            </h1>
          </motion.div>
          
          <motion.p 
            className="max-w-2xl text-muted-foreground text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Determine if an address is in a Low-to-Moderate Income (LMI) eligible census tract
            using U.S. Census Bureau data.
          </motion.p>
          
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link 
              to="/api-docs"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium"
            >
              <BookOpenIcon className="h-4 w-4 mr-1" />
              API Documentation
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
