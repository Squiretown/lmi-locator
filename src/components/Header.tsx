
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPinIcon } from 'lucide-react';

const Header = () => {
  return (
    <motion.header 
      className="sticky top-0 z-50 bg-black text-white py-4"
      initial={{
        opacity: 0,
        y: -20
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      transition={{
        duration: 0.5,
        ease: 'easeOut'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <MapPinIcon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold">LMICHECK.COM</span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Product
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Resources
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Customers
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-white hover:text-primary transition-colors hidden sm:inline-block">
              Log in
            </Link>
            <Button asChild size="sm" className="bg-white text-black hover:bg-white/90">
              <Link to="/login">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
