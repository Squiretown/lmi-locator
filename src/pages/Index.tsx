
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import PropertyChecker from '@/components/PropertyChecker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CheckCircle, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Constants to avoid duplication
const PAGE_TITLE = "LMICHECK.COM - LMI Property Checker";
const PAGE_DESCRIPTION = "Check if a property is in a Low-to-Moderate Income (LMI) census tract. Find eligible programs and incentives easily.";
const OG_DESCRIPTION = "Discover if your property is in a Low-to-Moderate Income (LMI) census tract and unlock special programs.";

// Reusable components
const FeatureCheck = ({ children }) => (
  <div className="flex items-center gap-2">
    <CheckCircle className="h-4 w-4 text-green-600" />
    <span>{children}</span>
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center mb-4">
    <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center mr-3">
      {icon}
    </div>
    <h2 className="text-xl font-bold">{title}</h2>
  </div>
);

const Index = () => {
  // Features list for the bottom of the card
  const features = [
    "Fast, accurate results",
    "Find assistance programs",
    "Connect with specialists"
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={OG_DESCRIPTION} />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="max-w-3xl mx-auto text-center mt-12 mb-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Determine If Your Dream Home Is In An LMI Eligible Area
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Check if a property is in a Low-to-Moderate Income (LMI) census tract and 
            unlock eligibility for special programs and incentives.
          </p>
          
          {/* Login Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/client-login">
              <Button variant="default" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Client Portal
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Professional Login
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Main card section */}
        <Card className="max-w-4xl mx-auto border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 md:p-8">
            <SectionHeader 
              icon={<CheckCircle className="h-4 w-4 text-white" />} 
              title="Check If A Property Is Eligible" 
            />
            
            <p className="text-muted-foreground mb-6">
              Find out if a property is in an LMI area and discover available assistance programs
            </p>
            
            <PropertyChecker />
            
            {/* Features section */}
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
              {features.map((feature, index) => (
                <FeatureCheck key={index}>{feature}</FeatureCheck>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Index;
