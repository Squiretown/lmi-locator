
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, MapPin, Calendar, Database, User, Globe } from "lucide-react";

interface SearchResultDetailModalProps {
  searchRecord: any;
  open: boolean;
  onClose: () => void;
}

export const SearchResultDetailModal: React.FC<SearchResultDetailModalProps> = ({
  searchRecord,
  open,
  onClose
}) => {
  if (!searchRecord) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderJsonData = (data: any, title: string) => {
    if (!data) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Search Result Details
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-base font-medium">{searchRecord.address}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Eligibility Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {searchRecord.is_eligible === null ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Unknown
                        </Badge>
                      ) : searchRecord.is_eligible ? (
                        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle className="h-3 w-3" />
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Not Eligible
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Search Date</label>
                    <p className="text-sm">{formatDate(searchRecord.searched_at)}</p>
                  </div>
                </div>

                {searchRecord.tract_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Census Tract ID</label>
                    <p className="text-sm font-mono">{searchRecord.tract_id}</p>
                  </div>
                )}

                {searchRecord.income_category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Income Category</label>
                    <Badge variant="secondary">{searchRecord.income_category}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Source Information */}
            {(searchRecord.data_source || searchRecord.data_vintage || searchRecord.data_provider) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Source Transparency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchRecord.data_source && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Source</label>
                      <p className="text-sm">{searchRecord.data_source}</p>
                    </div>
                  )}
                  
                  {searchRecord.data_vintage && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Vintage</label>
                      <p className="text-sm">{searchRecord.data_vintage}</p>
                    </div>
                  )}
                  
                  {searchRecord.data_collection_period && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Collection Period</label>
                      <p className="text-sm">{searchRecord.data_collection_period}</p>
                    </div>
                  )}
                  
                  {searchRecord.data_provider && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Provider</label>
                      <p className="text-sm">{searchRecord.data_provider}</p>
                    </div>
                  )}
                  
                  {searchRecord.data_last_updated && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(searchRecord.data_last_updated)}</p>
                    </div>
                  )}
                  
                  {searchRecord.data_methodology && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Methodology</label>
                      <p className="text-sm">{searchRecord.data_methodology}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Search Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-xs font-mono">{searchRecord.user_id || 'Anonymous'}</p>
                </div>
                
                {searchRecord.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-xs font-mono">{searchRecord.ip_address}</p>
                  </div>
                )}
                
                {searchRecord.user_agent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                    <p className="text-xs break-all">{searchRecord.user_agent}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Result Count</label>
                    <p className="text-sm">{searchRecord.result_count || 0}</p>
                  </div>
                  
                  {searchRecord.lmi_result_count !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">LMI Results</label>
                      <p className="text-sm">{searchRecord.lmi_result_count}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Raw Data */}
            {searchRecord.search_params && renderJsonData(searchRecord.search_params, "Search Parameters")}
            {searchRecord.result && renderJsonData(searchRecord.result, "Full Result Data")}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
