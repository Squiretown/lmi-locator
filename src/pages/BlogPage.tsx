
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: Date;
  category: string;
  imageUrl: string;
}

const BlogPage: React.FC = () => {
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Understanding LMI Census Tracts: A Complete Guide',
      excerpt: 'Learn everything you need to know about Low-to-Moderate Income census tracts and how they can benefit homebuyers and investors.',
      author: 'Emma Davis',
      date: new Date('2024-03-15'),
      category: 'Education',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      title: '5 Down Payment Assistance Programs You Should Know About',
      excerpt: 'Discover the top down payment assistance programs available for properties in LMI areas and how to qualify for them.',
      author: 'James Wilson',
      date: new Date('2024-03-02'),
      category: 'Finance',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'How Realtors Can Leverage LMI Data for Client Success',
      excerpt: 'Strategic approaches for real estate professionals to use LMI property information to better serve their clients.',
      author: 'Sophia Martinez',
      date: new Date('2024-02-19'),
      category: 'Real Estate',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '4',
      title: 'The Impact of LMI Programs on Community Development',
      excerpt: 'A look at how Low-to-Moderate Income programs contribute to neighborhood revitalization and economic growth.',
      author: 'Daniel Johnson',
      date: new Date('2024-02-05'),
      category: 'Community',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '5',
      title: 'Case Study: Successful LMI Property Investment Strategies',
      excerpt: 'Real-world examples of investors who have successfully built portfolios using properties in LMI census tracts.',
      author: 'Rachel Thompson',
      date: new Date('2024-01-22'),
      category: 'Investment',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '6',
      title: 'Latest Updates to Federal LMI Program Guidelines for 2023',
      excerpt: 'Stay informed about the recent changes to federal guidelines affecting Low-to-Moderate Income housing programs.',
      author: 'Alex Rodriguez',
      date: new Date('2024-01-10'),
      category: 'Policy',
      imageUrl: '/placeholder.svg'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Blog | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Read our latest articles about LMI programs, property investment, and homebuying tips." 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Blog" 
          description="Insights, guides, and news about LMI property opportunities"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {blogPosts.map(post => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="bg-muted px-2 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <CardTitle className="text-xl hover:text-primary transition-colors">
                  <a href="#">{post.title}</a>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between text-sm text-muted-foreground py-4 border-t">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(post.date, 'MMM d, yyyy')}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
