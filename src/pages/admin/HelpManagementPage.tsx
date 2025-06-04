import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const helpItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  order_index: z.number().min(0, 'Order must be 0 or greater'),
  is_published: z.boolean()
});

type HelpItemFormData = z.infer<typeof helpItemSchema>;

const categories = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'property-checking', label: 'Property Checking' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'support', label: 'Support' },
  { value: 'general', label: 'General' }
];

const HelpManagementPage: React.FC = () => {
  const [helpItems, setHelpItems] = useState<HelpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<HelpItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<HelpItemFormData>({
    resolver: zodResolver(helpItemSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      order_index: 0,
      is_published: true
    }
  });

  useEffect(() => {
    fetchHelpItems();
  }, []);

  const fetchHelpItems = async () => {
    try {
      const { data, error } = await supabase
        .from('help_items')
        .select('*')
        .order('category, order_index');

      if (error) {
        console.error('Error fetching help items:', error);
        toast.error('Failed to fetch help items');
      } else {
        setHelpItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching help items:', error);
      toast.error('Failed to fetch help items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: HelpItemFormData) => {
    try {
      // Ensure all required fields are present
      const insertData = {
        title: data.title,
        content: data.content,
        category: data.category,
        order_index: data.order_index,
        is_published: data.is_published
      };

      if (editingItem) {
        const { error } = await supabase
          .from('help_items')
          .update(insertData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Help item updated successfully');
      } else {
        const { error } = await supabase
          .from('help_items')
          .insert(insertData);

        if (error) throw error;
        toast.success('Help item created successfully');
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
      fetchHelpItems();
    } catch (error) {
      console.error('Error saving help item:', error);
      toast.error('Failed to save help item');
    }
  };

  const handleEdit = (item: HelpItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      content: item.content,
      category: item.category,
      order_index: item.order_index,
      is_published: item.is_published
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('help_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Help item deleted successfully');
      fetchHelpItems();
    } catch (error) {
      console.error('Error deleting help item:', error);
      toast.error('Failed to delete help item');
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    form.reset({
      title: '',
      content: '',
      category: 'general',
      order_index: helpItems.length,
      is_published: true
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help Management</h1>
          <p className="text-muted-foreground">Manage help articles and documentation</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Help Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Help Item' : 'Create Help Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the help item details below.' : 'Fill in the details to create a new help item.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter help item title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="order_index"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Index</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter help item content" 
                          rows={6}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this help item visible to users
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Help Items ({helpItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading help items...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {helpItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="capitalize">
                      {item.category.replace('-', ' ')}
                    </TableCell>
                    <TableCell>{item.order_index}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? 'default' : 'secondary'}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Help Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpManagementPage;
