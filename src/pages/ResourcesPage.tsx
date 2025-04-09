
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { FileTextIcon, BookOpenIcon, InfoIcon, MapIcon } from 'lucide-react';

const ResourcesPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Resources | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Access helpful resources about Low-to-Moderate Income programs, eligibility, and benefits." 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Resources" 
          description="Helpful guides and information about LMI programs"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <FileTextIcon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>LMI Program Guide</CardTitle>
                <CardDescription>Understanding eligibility and benefits</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Our comprehensive guide to Low-to-Moderate Income (LMI) programs, eligibility requirements, and available benefits for homebuyers.</p>
              <a href="#" className="text-primary hover:underline">Read the guide →</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <InfoIcon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Common questions about LMI property checking</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Find answers to frequently asked questions about LMI census tracts, eligibility verification, and how to use our tools.</p>
              <a href="#" className="text-primary hover:underline">View FAQs →</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MapIcon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Census Tract Maps</CardTitle>
                <CardDescription>Visual guides to LMI areas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Interactive maps showing Low-to-Moderate Income census tracts across the United States, with filtering options by state and county.</p>
              <a href="#" className="text-primary hover:underline">Explore maps →</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <BookOpenIcon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Program Documentation</CardTitle>
                <CardDescription>Detailed information about assistance programs</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Comprehensive documentation about various assistance programs available for properties in LMI census tracts, including eligibility criteria and application processes.</p>
              <a href="#" className="text-primary hover:underline">View documentation →</a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResourcesPage;
