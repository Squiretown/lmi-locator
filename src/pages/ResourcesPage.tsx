
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/Header';
import { FileTextIcon, BookOpenIcon, InfoIcon, MapIcon } from 'lucide-react';
import { getResources, Resource } from '@/lib/supabase/marketing';
import LoadingSpinner from '@/components/LoadingSpinner';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  // Function to render the correct icon based on resource.icon string
  const renderIcon = () => {
    switch (resource.icon) {
      case 'FileText':
        return <FileTextIcon className="h-8 w-8 text-primary" />;
      case 'BookOpen':
        return <BookOpenIcon className="h-8 w-8 text-primary" />;
      case 'Info':
        return <InfoIcon className="h-8 w-8 text-primary" />;
      case 'Map':
        return <MapIcon className="h-8 w-8 text-primary" />;
      default:
        return <FileTextIcon className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {renderIcon()}
        <div>
          <CardTitle>{resource.title}</CardTitle>
          <CardDescription>{resource.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{resource.description}</p>
        <a href={resource.url} className="text-primary hover:underline">Read more →</a>
      </CardContent>
    </Card>
  );
};

const ResourcesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Fallback resources if none are loaded from database
  const fallbackResources: Resource[] = [
    {
      id: '1',
      title: 'LMI Program Guide',
      description: 'Our comprehensive guide to Low-to-Moderate Income (LMI) programs, eligibility requirements, and available benefits for homebuyers.',
      icon: 'FileText',
      url: '#'
    },
    {
      id: '2',
      title: 'FAQ',
      description: 'Find answers to frequently asked questions about LMI census tracts, eligibility verification, and how to use our tools.',
      icon: 'Info',
      url: '#'
    },
    {
      id: '3',
      title: 'Census Tract Maps',
      description: 'Interactive maps showing Low-to-Moderate Income census tracts across the United States, with filtering options by state and county.',
      icon: 'Map',
      url: '#'
    },
    {
      id: '4',
      title: 'Program Documentation',
      description: 'Comprehensive documentation about various assistance programs available for properties in LMI census tracts, including eligibility criteria and application processes.',
      icon: 'BookOpen',
      url: '#'
    }
  ];

  const displayResources = resources.length > 0 ? resources : fallbackResources;

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
        <title>Resources | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Access helpful resources about Low-to-Moderate Income programs, eligibility, and benefits." 
        />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Resources" 
          description="Helpful guides and information about LMI programs"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {displayResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ResourcesPage;
