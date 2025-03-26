import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clearApiCache } from '@/lib/api/cache';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import GeocodeTest from '@/components/api-test/GeocodeTest';
import IncomeTest from '@/components/api-test/IncomeTest';
import LmiTest from '@/components/api-test/LmiTest';
import EsriTest from '@/components/api-test/EsriTest';
import EsriKeyTest from '@/components/api-test/EsriKeyTest';
import ResultsDisplay from '@/components/api-test/ResultsDisplay';
import ConnectionTester from '@/components/development/ConnectionTester';

const ApiTest = () => {
  const [address, setAddress] = useState('');
  const [tractId, setTractId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleClearCache = () => {
    clearApiCache();
    toast.success('API cache cleared');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      
      <h1 className="text-3xl font-bold mb-6">API Testing Tool</h1>
      <p className="text-muted-foreground mb-6">
        Use this page to test the various Census API functionality in the application.
      </p>
      
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleClearCache}>
          Clear API Cache
        </Button>
      </div>
      
      <div className="mb-8">
        <ConnectionTester />
      </div>
      
      <Tabs defaultValue="geocode" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geocode">Geocoding API</TabsTrigger>
          <TabsTrigger value="esri">ESRI API</TabsTrigger>
          <TabsTrigger value="esri-key">ESRI API Key</TabsTrigger>
          <TabsTrigger value="income">Income Data API</TabsTrigger>
          <TabsTrigger value="lmi">LMI Status Check</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geocode" className="space-y-4">
          <GeocodeTest 
            address={address}
            setAddress={setAddress}
            setTractId={setTractId}
            setResults={setResults}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
        
        <TabsContent value="esri" className="space-y-4">
          <EsriTest 
            setResults={setResults}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
        
        <TabsContent value="esri-key" className="space-y-4">
          <EsriKeyTest 
            setResults={setResults}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <IncomeTest 
            tractId={tractId}
            setTractId={setTractId}
            setResults={setResults}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
        
        <TabsContent value="lmi" className="space-y-4">
          <LmiTest 
            address={address}
            setAddress={setAddress}
            setResults={setResults}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
      </Tabs>
      
      <ResultsDisplay results={results} />
      
      <div className="mt-8 text-center">
        <a href="/" className="text-blue-600 hover:underline">
          Return to Home Page
        </a>
      </div>
    </div>
  );
};

export default ApiTest;
