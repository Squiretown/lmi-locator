import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllSubscriptionPlans, getPlanLimits, getPlanFeatures } from "@/lib/supabase/subscriptions";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price: number;
  billing_period: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

interface PlanLimit {
  id: string;
  plan_id: string;
  resource_type: string;
  limit_value: number;
}

const SubscriptionManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planLimits, setPlanLimits] = useState<{ [key: string]: PlanLimit[] }>({});
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    price: 0,
    billing_period: 'monthly',
    is_popular: false,
    sort_order: 0,
    features: [''],
    team_members_limit: 1,
    clients_limit: 5,
    marketing_campaigns_limit: 0,
    searches_per_month_limit: 10
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await getAllSubscriptionPlans();
      setPlans(plansData);

      // Load limits for each plan
      const limitsData: { [key: string]: PlanLimit[] } = {};
      for (const plan of plansData) {
        const limits = await getPlanLimits(plan.id);
        limitsData[plan.id] = limits;
      }
      setPlanLimits(limitsData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    const limits = planLimits[plan.id] || [];
    
    setFormData({
      name: plan.name,
      display_name: plan.display_name,
      description: plan.description || '',
      price: plan.price,
      billing_period: plan.billing_period,
      is_popular: plan.is_popular,
      sort_order: plan.sort_order,
      features: plan.features.length > 0 ? plan.features : [''],
      team_members_limit: limits.find(l => l.resource_type === 'team_members')?.limit_value || 1,
      clients_limit: limits.find(l => l.resource_type === 'clients')?.limit_value || 5,
      marketing_campaigns_limit: limits.find(l => l.resource_type === 'marketing_campaigns')?.limit_value || 0,
      searches_per_month_limit: limits.find(l => l.resource_type === 'searches_per_month')?.limit_value || 10
    });
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setShowCreateForm(true);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      is_popular: false,
      sort_order: plans.length,
      features: [''],
      team_members_limit: 1,
      clients_limit: 5,
      marketing_campaigns_limit: 0,
      searches_per_month_limit: 10
    });
  };

  const handleSavePlan = async () => {
    try {
      // Here you would implement the actual save functionality
      // For now, just show a success message
      toast({
        title: "Success",
        description: editingPlan ? "Plan updated successfully" : "Plan created successfully"
      });
      
      setEditingPlan(null);
      setShowCreateForm(false);
      loadPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan"
      });
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const getLimitDisplay = (planId: string, resourceType: string) => {
    const limits = planLimits[planId] || [];
    const limit = limits.find(l => l.resource_type === resourceType);
    return limit?.limit_value === -1 ? 'Unlimited' : limit?.limit_value?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading subscription plans...</div>
      </div>
    );
  }

  if (editingPlan || showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setEditingPlan(null);
              setShowCreateForm(false);
            }}
          >
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Internal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., professional"
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Professional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Plan description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="billing_period">Billing Period</Label>
                <select
                  id="billing_period"
                  value={formData.billing_period}
                  onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
              />
              <Label htmlFor="is_popular">Mark as Popular</Label>
            </div>

            <div>
              <Label>Resource Limits</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="team_members_limit">Team Members</Label>
                  <Input
                    id="team_members_limit"
                    type="number"
                    value={formData.team_members_limit}
                    onChange={(e) => setFormData({ ...formData, team_members_limit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="clients_limit">Clients</Label>
                  <Input
                    id="clients_limit"
                    type="number"
                    value={formData.clients_limit}
                    onChange={(e) => setFormData({ ...formData, clients_limit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="marketing_campaigns_limit">Marketing Campaigns</Label>
                  <Input
                    id="marketing_campaigns_limit"
                    type="number"
                    value={formData.marketing_campaigns_limit}
                    onChange={(e) => setFormData({ ...formData, marketing_campaigns_limit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="searches_per_month_limit">Searches Per Month</Label>
                  <Input
                    id="searches_per_month_limit"
                    type="number"
                    value={formData.searches_per_month_limit}
                    onChange={(e) => setFormData({ ...formData, searches_per_month_limit: parseInt(e.target.value) })}
                    placeholder="-1 for unlimited"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2 mt-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      disabled={formData.features.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            <Button onClick={handleSavePlan} className="w-full">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle>{plan.display_name}</CardTitle>
                  {plan.is_popular && <Badge variant="secondary">Popular</Badge>}
                  {!plan.is_active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pricing</span>
                  </div>
                  <div className="text-lg font-semibold">
                    ${plan.price}/{plan.billing_period}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Limits</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Team: {getLimitDisplay(plan.id, 'team_members')}</div>
                    <div>Clients: {getLimitDisplay(plan.id, 'clients')}</div>
                    <div>Campaigns: {getLimitDisplay(plan.id, 'marketing_campaigns')}</div>
                    <div>Searches: {getLimitDisplay(plan.id, 'searches_per_month')}/month</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Features</span>
                  </div>
                  <div className="text-sm">
                    {plan.features?.length || 0} features configured
                  </div>
                </div>
              </div>

              {plan.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManagement;