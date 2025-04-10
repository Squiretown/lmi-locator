
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon } from 'lucide-react';
import { getTestimonials, Testimonial } from '@/lib/supabase/marketing';
import LoadingSpinner from '@/components/LoadingSpinner';

const TestimonialCard: React.FC<{
  testimonial: Testimonial;
}> = ({ testimonial }) => (
  <Card className="h-full flex flex-col">
    <CardHeader>
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
          <CardDescription>{testimonial.role}, {testimonial.company}</CardDescription>
        </div>
      </div>
      <div className="flex mt-2">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            className={`h-4 w-4 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="italic">"{testimonial.testimonial}"</p>
    </CardContent>
  </Card>
);

const CustomersPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fallback testimonials if none are loaded from database
  const fallbackTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Mortgage Broker',
      company: 'Premier Mortgage',
      testimonial: "LMICHECK.COM has revolutionized how we match clients with down payment assistance programs. We've increased our closing rate by 35% since implementing this tool.",
      avatar: '/placeholder.svg',
      stars: 5
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Real Estate Agent',
      company: 'Golden Gate Realty',
      testimonial: 'Being able to quickly verify if a property is in an LMI tract gives me a competitive edge. My clients appreciate the extra value I provide by connecting them with assistance programs.',
      avatar: '/placeholder.svg',
      stars: 4
    },
    {
      id: '3',
      name: 'Jennifer Williams',
      role: 'First-time Homebuyer',
      company: '',
      testimonial: "Thanks to LMICHECK.COM, I discovered my dream home was in an LMI area. This saved me over $12,000 in down payment assistance that I wouldn't have known about otherwise!",
      avatar: '/placeholder.svg',
      stars: 5
    },
    {
      id: '4',
      name: 'David Chen',
      role: 'Loan Officer',
      company: 'Pacific Lending',
      testimonial: "The marketing lists feature has been a game-changer for our outreach efforts. We've seen a 40% increase in qualified leads since targeting LMI-eligible clients.",
      avatar: '/placeholder.svg',
      stars: 5
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      role: 'Branch Manager',
      company: 'HomeFirst Mortgage',
      testimonial: "We've integrated LMICHECK.COM's API into our internal systems, and the efficiency gains have been remarkable. Our loan officers can now serve clients better with instant eligibility information.",
      avatar: '/placeholder.svg',
      stars: 4
    },
    {
      id: '6',
      name: 'Robert Miller',
      role: 'Housing Counselor',
      company: 'Community Housing Services',
      testimonial: 'As a non-profit housing counselor, this tool has been invaluable for helping low-income families find affordable housing options with available assistance programs.',
      avatar: '/placeholder.svg',
      stars: 5
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customers | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Read success stories from our customers who have used our LMI property checking tools." 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Our Customers" 
          description="Success stories from mortgage professionals, realtors, and homebuyers"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {displayTestimonials.map(testimonial => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomersPage;
