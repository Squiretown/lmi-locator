import React from 'react';
import { motion } from 'framer-motion';
import { Info, Github, Book, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
const Footer = () => {
  return <motion.footer initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.5,
    delay: 0.5
  }} className="mt-20 py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">About LMICHECK.COM</h3>
              <p className="text-sm text-muted-foreground">We utilize data to identify properties in Low-to-Moderate Income (LMI) census tracts, helping homebuyers access special programs and incentives.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@lmicheck.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Suffolk, NY </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>About LMI Programs</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <span className="block">Data Source: U.S. Census Bureau American Community Survey 5-Year Estimates</span>
              <span className="block mt-1">© {new Date().getFullYear()} LMICHECK.COM - All Rights Reserved</span>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>;
};
export default Footer;