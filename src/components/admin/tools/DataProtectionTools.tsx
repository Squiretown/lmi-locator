
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, Trash2, Database, Settings } from "lucide-react";
import { toast } from "sonner";

export const DataProtectionTools: React.FC = () => {
  const handleQuickExport = () => {
    toast.info("Redirecting to data export tools");
    window.location.href = '/admin/data-protection';
  };

  const handleQuickDeletion = () => {
    toast.info("Redirecting to data deletion tools");
    window.location.href = '/admin/data-protection';
  };

  const handleRetentionPolicies = () => {
    toast.info("Redirecting to retention policy management");
    window.location.href = '/admin/data-protection';
  };

  const handlePrivacyOverride = () => {
    toast.info("Redirecting to privacy override tools");
    window.location.href = '/admin/data-protection';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Data Protection & GDPR Compliance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data Export (GDPR Article 20)
            </CardTitle>
            <CardDescription>
              Export user data for portability rights compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" onClick={handleQuickExport} className="w-full">
              Access Export Tools
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Data Deletion (Right to be Forgotten)
            </CardTitle>
            <CardDescription>
              Process user data deletion requests
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" onClick={handleQuickDeletion} className="w-full">
              Access Deletion Tools
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Retention Policies
            </CardTitle>
            <CardDescription>
              Configure automated data lifecycle management
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" onClick={handleRetentionPolicies} className="w-full">
              Manage Retention Policies
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Privacy Settings Override
            </CardTitle>
            <CardDescription>
              Administrative access to user privacy controls
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" onClick={handlePrivacyOverride} className="w-full">
              Access Privacy Tools
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
