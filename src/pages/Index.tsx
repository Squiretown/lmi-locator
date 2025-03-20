import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckLmiStatusResponse } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { Dot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
})

const Index = () => {
  const [lmiStatus, setLmiStatus] = useState<CheckLmiStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLmiStatus(null);
    try {
      const response = await fetch(`/api/check-lmi-status?address=${values.address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setLmiStatus(result);
    } catch (error: any) {
      console.error("Failed to check LMI status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to check LMI status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">LMI Property Checker</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Check if a property is in a Low-to-Moderate Income (LMI) census tract
          and eligible for special programs and incentives.
        </p>
        <div className="mt-4">
          <a href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
            Admin Dashboard →
          </a>
        </div>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Anytown, CA" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the full street address to check LMI eligibility.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Checking..." : "Check LMI Status"}
          </Button>
        </form>
      </Form>

      {lmiStatus && (
        <Card className="mt-8">
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={lmiStatus.is_approved ? "success" : "destructive"}>
                {lmiStatus.is_approved ? "LMI Eligible" : "Not LMI Eligible"}
              </Badge>
              <Dot className={lmiStatus.is_approved ? "text-green-500" : "text-red-500"} size={16} />
              <span>{lmiStatus.address}</span>
            </div>
            <p className="text-sm text-gray-500">{lmiStatus.approval_message}</p>
            <Button variant="link" onClick={() => navigate('/api-docs')}>
              Learn more about the data source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
