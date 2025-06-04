
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/Header';

const ProductPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Product | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Learn about our LMI property checking product, features, and how it can benefit you." 
        />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Our Product" 
          description="Discover how our LMI property checker can help you find eligible properties"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Property Lookup</CardTitle>
              <CardDescription>Fast and accurate property eligibility checking</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Enter any property address and instantly find out if it's located in an LMI census tract, qualifying it for special programs and incentives.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Program Matching</CardTitle>
              <CardDescription>Find the right assistance programs</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Get matched with down payment assistance, tax credits, and other incentives based on the property's location and your personal eligibility.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Professional Tools</CardTitle>
              <CardDescription>For realtors and mortgage professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Advanced features for professionals including batch property checking, client management, and marketing lists generation.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
