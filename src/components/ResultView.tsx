import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronsUpDown, MapPin, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePropertySearch, formSchema } from '@/hooks/usePropertySearch';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ResultsMap } from '@/components';

interface ResultViewProps {
  states: { value: string; label: string }[];
}

const ResultView: React.FC<ResultViewProps> = ({ states }) => {
  const { lmiStatus, isLoading, submitPropertySearch } = usePropertySearch();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitPropertySearch(values);
  }

  return (
    <div className="container relative mx-auto max-w-2xl p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Property Checker</CardTitle>
          <CardDescription>Enter an address to check LMI eligibility</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Anytown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row gap-2">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className={cn(
                                "flex justify-between items-center w-full [&[data-state=open]]:bg-accent [&[data-state=open]]:text-accent-foreground",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? states.find(
                                  (state) => state.value === field.value
                                )?.label
                                : "Select state"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandList>
                              <CommandEmpty>No state found.</CommandEmpty>
                              <CommandGroup>
                                {states.map((state) => (
                                  <CommandItem
                                    value={state.label}
                                    key={state.value}
                                    onSelect={() => {
                                      form.setValue("state", state.value);
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        state.value === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {state.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zip code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2V4M12 20V22M4.92 4.92L6.34 6.34M17.66 17.66L19.08 19.08M2 12H4M20 12H22M4.92 19.08L6.34 17.66M17.66 6.34L19.08 4.92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Check Status
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {lmiStatus && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>LMI Eligibility Result</CardTitle>
              <CardDescription>Details of the LMI eligibility check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Address: {lmiStatus.address}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">LMI Status:</Label>
                <Badge variant={lmiStatus.is_approved ? "success" : "destructive"}>
                  {lmiStatus.lmi_status}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Tract ID:</Label>
                  <p className="text-sm font-medium">{lmiStatus.tract_id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Median Income:</Label>
                  <p className="text-sm font-medium">${lmiStatus.median_income?.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">AMI Percentage:</Label>
                  <p className="text-sm font-medium">{lmiStatus.percentage_of_ami}%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Income Category:</Label>
                  <p className="text-sm font-medium">{lmiStatus.income_category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ResultsMap
            lat={34.052235}
            lon={-118.243683}
            isEligible={lmiStatus.is_approved}
            tractId={lmiStatus.tract_id}
          />
        </div>
      )}
    </div>
  );
};

export default ResultView;
