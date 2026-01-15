import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Building, Phone, Mail, Check } from 'lucide-react';
import { useProfessionalSearch } from '@/hooks/useProfessionalSearch';
import { useUnifiedCRM } from '@/hooks/useUnifiedCRM';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalType: 'mortgage_professional' | 'realtor';
}

export function AddManualProfessionalDialog({ open, onOpenChange, professionalType }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const { teamMembers } = useUnifiedCRM();
  const excludeIds = teamMembers.map(m => m.id);

  const { results, isLoading } = useProfessionalSearch({
    query: searchQuery,
    professionalType,
    excludeIds,
    excludeSelf: true
  });

  const { addExistingProfessional, isAddingProfessional } = useUnifiedCRM();

  const handleAdd = async () => {
    if (!selectedProfessional) return;

    try {
      await addExistingProfessional({
        professionalId: selectedProfessional.id,
        notes: notes.trim() || undefined
      });
      
      // Reset state BEFORE closing dialog
      setSearchQuery('');
      setSelectedProfessional(null);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError
      // But reset selectedProfessional to prevent freeze
      setSelectedProfessional(null);
    }
  };

  // Cleanup when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset all state when dialog closes
      setSearchQuery('');
      setSelectedProfessional(null);
      setNotes('');
    }
    onOpenChange(open);
  };

  const typeLabel = professionalType === 'realtor' ? 'Realtor' : 'Mortgage Professional';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Existing {typeLabel}</DialogTitle>
          <DialogDescription>
            Search for a {typeLabel.toLowerCase()} already in the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label>Search {typeLabel}s</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search by name, company, email, or license...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No {typeLabel.toLowerCase()}s found
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((professional) => (
                    <Card
                      key={professional.id}
                      className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                        selectedProfessional?.id === professional.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedProfessional(professional)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{professional.name}</h4>
                            <Badge variant="secondary">{typeLabel}</Badge>
                          </div>
                          
                          {professional.company && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              {professional.company}
                            </div>
                          )}
                          
                          {professional.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {professional.phone}
                            </div>
                          )}
                          
                          {professional.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {professional.email}
                            </div>
                          )}

                          {professional.license_number && (
                            <div className="text-xs text-muted-foreground">
                              License: {professional.license_number}
                            </div>
                          )}
                        </div>

                        {selectedProfessional?.id === professional.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes (Optional) */}
          {selectedProfessional && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this partnership..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={!selectedProfessional || isAddingProfessional}
            >
              {isAddingProfessional ? 'Adding...' : 'Add to Team'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
