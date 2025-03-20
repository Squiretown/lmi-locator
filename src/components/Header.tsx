
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileTextIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-background py-4 border-b border-border sticky top-0 z-40 backdrop-blur-sm">
      <motion.div 
        className="container mx-auto px-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">Census LMI Finder</span>
        </Link>
        
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/api-docs" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              <span className="hidden sm:inline">API Docs</span>
            </Link>
          </Button>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;
