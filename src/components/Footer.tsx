import React from 'react';
import { motion } from 'framer-motion';
import { Info as InfoIcon, Github as GithubIcon, Book as BookIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
const Footer = () => {
  return <motion.footer initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.5,
    delay: 0.5
  }} className="mt-20 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Separator className="mb-6" />
          
          <div className="text-center text-sm text-muted-foreground space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <p className="font-medium text-foreground">LMICHECK.COM
            </p>
              <p>Utilizing U.S. Census Bureau data to identify LMI eligible census tracts</p>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              <a href="#" className="p-2 hover:text-foreground transition-colors" aria-label="GitHub repository">
                <GithubIcon className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 hover:text-foreground transition-colors" aria-label="Documentation">
                <BookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 hover:text-foreground transition-colors" aria-label="Information">
                <InfoIcon className="h-5 w-5" />
              </a>
            </div>
            
            <p>
              <span className="block">Data Source: U.S. Census Bureau American Community Survey 5-Year Estimates</span>
              <span className="block mt-1">© {new Date().getFullYear()} Census LMI Finder</span>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>;
};
export default Footer;