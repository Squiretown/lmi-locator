
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: string;
  order_index: number;
}

const HelpPage: React.FC = () => {
  const [helpItems, setHelpItems] = useState<HelpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHelpItems();
  }, []);

  const fetchHelpItems = async () => {
    try {
      const { data, error } = await supabase
        .from('help_items')
        .select('*')
        .eq('is_published', true)
        .order('order_index');

      if (error) {
        console.error('Error fetching help items:', error);
      } else {
        setHelpItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching help items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedItems = helpItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, HelpItem[]>);

  const filteredItems = helpItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Object.keys(groupedItems);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Help Center | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Get help and find answers to frequently asked questions about using LMICHECK.COM." 
        />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Help Center" 
          description="Find answers to your questions and learn how to use our platform"
        />
        
        <div className="mt-8 mb-8">
          <div className="relative max-w-md mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchQuery ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Search Results ({filteredItems.length})</h2>
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No help articles found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredItems.map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{item.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category.replace('-', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="grid gap-6">
                  {groupedItems[category].map(item => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </>
  );
};

export default HelpPage;
