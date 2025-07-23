import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlanTier, CreateCompanyInput } from '@/types/domain';
import { useCreateCompany } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyModal({ open, onOpenChange }: CreateCompanyModalProps) {
  const [formData, setFormData] = useState<CreateCompanyInput>({
    name: '',
    companyUid: '',
    planTier: 'trial',
    maxSeats: 5,
  });
  
  const createCompany = useCreateCompany();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.companyUid.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Company name and UID are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCompany.mutateAsync(formData);
      toast({
        title: 'Company created',
        description: `${formData.name} has been created successfully.`,
      });
      onOpenChange(false);
      setFormData({
        name: '',
        companyUid: '',
        planTier: 'trial',
        maxSeats: 5,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create company. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof CreateCompanyInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCompanyUid = () => {
    if (!formData.name) return;
    const uid = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, companyUid: uid }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Add a new company to the platform. They will be created with trial status.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="companyUid">Company UID</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateCompanyUid}
                disabled={!formData.name}
              >
                Generate
              </Button>
            </div>
            <Input
              id="companyUid"
              value={formData.companyUid}
              onChange={(e) => handleInputChange('companyUid', e.target.value)}
              placeholder="unique-company-id"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planTier">Plan Tier</Label>
            <Select 
              value={formData.planTier} 
              onValueChange={(value: PlanTier) => handleInputChange('planTier', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSeats">Max Seats</Label>
            <Input
              id="maxSeats"
              type="number"
              min="1"
              max="1000"
              value={formData.maxSeats || ''}
              onChange={(e) => handleInputChange('maxSeats', parseInt(e.target.value) || 0)}
              placeholder="5"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCompany.isPending}
            >
              {createCompany.isPending ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}