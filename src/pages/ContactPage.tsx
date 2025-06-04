import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/Header';
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage: React.FC = () => {
  const {
    toast
  } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });
  const handleSubmit = (values: ContactFormValues) => {
    // In a real app, this would send the form data to a backend API
    console.log('Form submitted:', values);
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you shortly."
    });
    form.reset();
  };
  return (
    <>
      <Helmet>
        <title>Contact Us | LMICHECK.COM</title>
        <meta name="description" content="Get in touch with our team for support, questions, or partnership opportunities." />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader title="Contact Us" description="Get in touch with our team for any questions or support" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <FormField control={form.control} name="email" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>
                    
                    <FormField control={form.control} name="subject" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="message" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Please type your message here..." rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MailIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:info@lmicheck.com" className="text-muted-foreground hover:text-primary">support@lmicheck.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:5551234567" className="text-muted-foreground hover:text-primary">
                      (555) 123-4567
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Office</p>
                    <p className="text-muted-foreground">
                      123 Main Street<br />
                      Suffolk, NY 11701
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9am - 5pm<br />
                      Saturday: 10am - 2pm<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <a href="#" className="bg-muted hover:bg-primary/20 transition-colors rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="#" className="bg-muted hover:bg-primary/20 transition-colors rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" className="bg-muted hover:bg-primary/20 transition-colors rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                  <a href="#" className="bg-muted hover:bg-primary/20 transition-colors rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect width="4" height="12" x="2" y="9"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
