import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Loader2, Settings } from "lucide-react";
import { getAllSubscriptionPlans, getPlanLimits, getPlanFeatures, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "@/lib/supabase/subscriptions";
import { useToast } from "@/hooks/use-toast";

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
  is_trial?: boolean;
  trial_period_days?: number;
}

interface PlanLimit {
  id: string;
  plan_id: string;
  resource_type: string;
  limit_value: number;
}

interface PlanFeature {
  id: string;
  plan_id: string;
  feature_name: string;
  feature_value?: string;
  is_enabled: boolean;
}

// Available feature definitions
const AVAILABLE_FEATURES = [
  { key: 'api_access', label: 'API Access', type: 'boolean' as const },
  { key: 'crm_integrations', label: 'CRM Integration', type: 'multi-select' as const, options: ['hubspot', 'salesforce', 'pipedrive'] },
  { key: 'iframe_embed', label: 'iFrame Embed', type: 'boolean' as const },
  { key: 'white_label', label: 'White Label Branding', type: 'boolean' as const },
  { key: 'ai_lead_scoring', label: 'AI Lead Scoring', type: 'boolean' as const },
  { key: 'custom_reports', label: 'Custom Reports', type: 'boolean' as const },
  { key: 'multi_user', label: 'Multi-user Login', type: 'boolean' as const }
];

const SubscriptionManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planLimits, setPlanLimits] = useState<{ [key: string]: PlanLimit[] }>({});
  const [planFeatures, setPlanFeatures] = useState<{ [key: string]: PlanFeature[] }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    price: 0,
    billing_period: 'monthly' as 'monthly' | 'yearly',
    is_popular: false,
    is_active: true,
    sort_order: 0,
    features: [] as string[],
    limits: {} as { [key: string]: number },
    plan_features: {} as { [key: string]: { enabled: boolean; value?: string[] } }
  });

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the "${planName}" plan? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteSubscriptionPlan(planId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Plan deleted successfully",
        });
        loadPlans(); // Reload the plans list
      } else {
        toast({
          title: "Error", 
          description: result.error || "Failed to delete plan",
        });
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await getAllSubscriptionPlans();
      setPlans(plansData);

      // Load limits and features for each plan
      const limitsData: { [key: string]: PlanLimit[] } = {};
      const featuresData: { [key: string]: PlanFeature[] } = {};
      
      for (const plan of plansData) {
        const limits = await getPlanLimits(plan.id);
        const features = await getPlanFeatures(plan.id);
        limitsData[plan.id] = limits;
        featuresData[plan.id] = features;
      }
      
      setPlanLimits(limitsData);
      setPlanFeatures(featuresData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    const limits = planLimits[plan.id] || [];
    const features = planFeatures[plan.id] || [];
    
    // Convert features to the form format
    const formFeatures: { [key: string]: { enabled: boolean; value?: string[] } } = {};
    AVAILABLE_FEATURES.forEach(feature => {
      const dbFeature = features.find(f => f.feature_name === feature.key);
      if (feature.type === 'multi-select') {
        const value = dbFeature?.feature_value ? JSON.parse(dbFeature.feature_value) : [];
        formFeatures[feature.key] = {
          enabled: dbFeature?.is_enabled || false,
          value: Array.isArray(value) ? value : []
        };
      } else {
        formFeatures[feature.key] = {
          enabled: dbFeature?.is_enabled || false
        };
      }
    });
    
    setFormData({
      name: plan.name,
      display_name: plan.display_name,
      description: plan.description || '',
      price: plan.price / 100, // Convert cents to dollars for display
      billing_period: plan.billing_period as 'monthly',
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
      features: plan.features.length > 0 ? plan.features : [''],
      limits: {
        team_members: limits.find(l => l.resource_type === 'team_members')?.limit_value || 1,
        clients: limits.find(l => l.resource_type === 'clients')?.limit_value || 5,
        marketing_campaigns: limits.find(l => l.resource_type === 'marketing_campaigns')?.limit_value || 0,
        searches_per_month: limits.find(l => l.resource_type === 'searches_per_month')?.limit_value || 10
      },
      plan_features: formFeatures
    });
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setShowCreateForm(true);
    
    // Initialize default features
    const defaultFeatures: { [key: string]: { enabled: boolean; value?: string[] } } = {};
    AVAILABLE_FEATURES.forEach(feature => {
      if (feature.type === 'multi-select') {
        defaultFeatures[feature.key] = { enabled: false, value: [] };
      } else {
        defaultFeatures[feature.key] = { enabled: false };
      }
    });
    
    setFormData({
      name: '',
      display_name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      is_popular: false,
      is_active: true,
      sort_order: plans.length,
      features: [''],
      limits: {
        team_members: 1,
        clients: 5,
        marketing_campaigns: 0,
        searches_per_month: 10
      },
      plan_features: defaultFeatures
    });
  };

  const handleSavePlan = async () => {
    if (!formData.display_name || !formData.name || formData.price === undefined) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setSaving(true);
    try {
      const planData = {
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        price: Math.round(formData.price * 100), // Convert dollars to cents
        billing_period: formData.billing_period,
        is_popular: formData.is_popular,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        features: formData.features,
        limits: Object.entries(formData.limits || {}).map(([resource_type, limit_value]) => ({
          resource_type: resource_type as 'team_members' | 'clients' | 'marketing_campaigns' | 'searches_per_month',
          limit_value: Number(limit_value)
        })),
        plan_features: Object.entries(formData.plan_features || {}).map(([feature_name, config]) => ({
          feature_name,
          feature_value: config.value ? JSON.stringify(config.value) : null,
          is_enabled: config.enabled
        }))
      };

      let result;
      if (editingPlan) {
        result = await updateSubscriptionPlan({ id: editingPlan.id, ...planData });
      } else {
        result = await createSubscriptionPlan(planData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Plan ${editingPlan ? 'updated' : 'created'} successfully`,
        });
        setEditingPlan(null);
        setShowCreateForm(false);
        loadPlans(); // Reload the plans list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save plan",
        });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setSaving(false);
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

  const getFeatureDisplay = (planId: string, featureKey: string) => {
    const features = planFeatures[planId] || [];
    const feature = features.find(f => f.feature_name === featureKey);
    return feature?.is_enabled || false;
  };

  const getCRMIntegrations = (planId: string) => {
    const features = planFeatures[planId] || [];
    const crmFeature = features.find(f => f.feature_name === 'crm_integrations');
    if (crmFeature?.feature_value) {
      try {
        const integrations = JSON.parse(crmFeature.feature_value);
        return Array.isArray(integrations) ? integrations : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleFeatureToggle = (featureKey: string, enabled: boolean) => {
    setFormData({
      ...formData,
      plan_features: {
        ...formData.plan_features,
        [featureKey]: {
          ...formData.plan_features[featureKey],
          enabled
        }
      }
    });
  };

  const handleCRMSelection = (featureKey: string, integration: string, selected: boolean) => {
    const currentValue = formData.plan_features[featureKey]?.value || [];
    const newValue = selected 
      ? [...currentValue, integration]
      : currentValue.filter(item => item !== integration);
    
    setFormData({
      ...formData,
      plan_features: {
        ...formData.plan_features,
        [featureKey]: {
          ...formData.plan_features[featureKey],
          value: newValue
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscription plans...</span>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Internal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., professional"
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Professional"
                  required
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
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billing_period">Billing Period</Label>
                <Select value={formData.billing_period} onValueChange={(value) => setFormData({ ...formData, billing_period: value as 'monthly' | 'yearly' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label htmlFor="is_popular">Mark as Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div>
              <Label>Resource Limits</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="team_members_limit">Team Members</Label>
                  <Input
                    id="team_members_limit"
                    type="number"
                    value={formData.limits.team_members || 1}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, team_members: parseInt(e.target.value) || 1 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="clients_limit">Clients</Label>
                  <Input
                    id="clients_limit"
                    type="number"
                    value={formData.limits.clients || 5}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, clients: parseInt(e.target.value) || 5 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="marketing_campaigns_limit">Marketing Campaigns</Label>
                  <Input
                    id="marketing_campaigns_limit"
                    type="number"
                    value={formData.limits.marketing_campaigns || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, marketing_campaigns: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="searches_per_month_limit">Searches Per Month</Label>
                  <Input
                    id="searches_per_month_limit"
                    type="number"
                    value={formData.limits.searches_per_month || 10}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, searches_per_month: parseInt(e.target.value) || 10 }
                    })}
                    placeholder="-1 for unlimited"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Plan Features</Label>
              <div className="space-y-4 mt-4 p-4 border rounded-lg">
                {AVAILABLE_FEATURES.map((feature) => (
                  <div key={feature.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={feature.key}
                          checked={formData.plan_features[feature.key]?.enabled || false}
                          onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked as boolean)}
                        />
                        <Label htmlFor={feature.key} className="font-medium">
                          {feature.label}
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.type === 'boolean' ? 'Toggle' : 'Multi-select'}
                      </Badge>
                    </div>
                    
                    {feature.type === 'multi-select' && formData.plan_features[feature.key]?.enabled && (
                      <div className="ml-6 space-y-2">
                        <Label className="text-sm text-muted-foreground">Available {feature.label} Options:</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {feature.options?.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${feature.key}-${option}`}
                                checked={formData.plan_features[feature.key]?.value?.includes(option) || false}
                                onCheckedChange={(checked) => handleCRMSelection(feature.key, option, checked as boolean)}
                              />
                              <Label htmlFor={`${feature.key}-${option}`} className="text-sm capitalize">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Feature Descriptions (Marketing Copy)</Label>
              <div className="space-y-2 mt-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="Feature description for marketing"
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
                  Add Description
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePlan} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingPlan(null);
                setShowCreateForm(false);
              }} disabled={saving}>
                Cancel
              </Button>
            </div>
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
                  <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id, plan.display_name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Pricing</div>
                  <div className="text-lg font-semibold">
                    ${(plan.price / 100).toFixed(2)}/{plan.billing_period}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Limits</div>
                  <div className="text-sm space-y-1">
                    <div>Team: {getLimitDisplay(plan.id, 'team_members')}</div>
                    <div>Clients: {getLimitDisplay(plan.id, 'clients')}</div>
                    <div>Campaigns: {getLimitDisplay(plan.id, 'marketing_campaigns')}</div>
                    <div>Searches: {getLimitDisplay(plan.id, 'searches_per_month')}/month</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Features</div>
                  <div className="space-y-1">
                    {plan.is_trial && (
                      <div className="mb-2 p-2 bg-primary/10 rounded text-xs">
                        <strong>Trial Plan:</strong> {plan.trial_period_days} days
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {AVAILABLE_FEATURES.map((feature) => (
                        <div key={feature.key} className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getFeatureDisplay(plan.id, feature.key) ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={getFeatureDisplay(plan.id, feature.key) ? 'text-green-700' : 'text-red-700'}>
                            {feature.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {getCRMIntegrations(plan.id).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        CRM: {getCRMIntegrations(plan.id).join(', ')}
                      </div>
                    )}
                    
                    {plan.features.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                        Marketing: {plan.features.slice(0, 2).join(', ')}
                        {plan.features.length > 2 && ` +${plan.features.length - 2} more`}
                      </div>
                    )}
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