
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info as InfoIcon, 
  Github as GithubIcon, 
  Book as BookIcon, 
  Mail as MailIcon, 
  Phone as PhoneIcon, 
  Linkedin as LinkedinIcon 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5, delay: 0.5 }} 
      className="mt-20 py-8 bg-muted/10"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Separator className="mb-6" />
          
          <div className="text-center text-sm text-muted-foreground space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <p className="font-bold text-xl text-foreground">LMICHECK.COM</p>
              <p>Utilizing U.S. Census Bureau data to identify LMI eligible census tracts</p>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              <a 
                href="mailto:support@lmicheck.com" 
                className="flex items-center space-x-2 p-2 hover:text-foreground transition-colors" 
                aria-label="Email Support"
              >
                <MailIcon className="h-5 w-5" />
                <span>support@lmicheck.com</span>
              </a>
              <a 
                href="tel:+18005551234" 
                className="flex items-center space-x-2 p-2 hover:text-foreground transition-colors" 
                aria-label="Contact Phone"
              >
                <PhoneIcon className="h-5 w-5" />
                <span>1-800-555-1234</span>
              </a>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              <a 
                href="https://github.com/lmicheck" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 hover:text-foreground transition-colors" 
                aria-label="GitHub repository"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/company/lmicheck" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 hover:text-foreground transition-colors" 
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a 
                href="/about" 
                className="p-2 hover:text-foreground transition-colors" 
                aria-label="About Us"
              >
                <InfoIcon className="h-5 w-5" />
              </a>
            </div>
            
            <p>
              <span className="block">Data Source: U.S. Census Bureau American Community Survey 5-Year Estimates</span>
              <span className="block mt-1">© {new Date().getFullYear()} Census LMI Finder. All Rights Reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
