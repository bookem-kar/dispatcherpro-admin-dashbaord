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
import { CreateCompanyInput } from '@/types/domain';
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
    phoneNumber: '',
    address: '',
    email: '',
    mcNumber: '',
    website: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    phoneTollFree: '',
    faxNumber: ''
  });
  
  const createCompany = useCreateCompany();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.address.trim() || 
        !formData.email.trim() || !formData.mcNumber.trim() || !formData.website.trim() ||
        !formData.adminFirstName.trim() || !formData.adminLastName.trim() || 
        !formData.adminEmail.trim() || !formData.adminPhone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
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
        phoneNumber: '',
        address: '',
        email: '',
        mcNumber: '',
        website: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPhone: '',
        phoneTollFree: '',
        faxNumber: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create company. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof CreateCompanyInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Add a new company to the platform. An admin user will be created for the company.
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
            <Label htmlFor="phoneTollFree">Company Phone Toll Free</Label>
            <Input
              id="phoneTollFree"
              value={formData.phoneTollFree}
              onChange={(e) => handleInputChange('phoneTollFree', e.target.value)}
              placeholder="800-555-0123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Company Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="555-123-4567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faxNumber">Company Fax Number</Label>
            <Input
              id="faxNumber"
              value={formData.faxNumber}
              onChange={(e) => handleInputChange('faxNumber', e.target.value)}
              placeholder="555-123-4568"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Company Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, City, ST 12345"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Company Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="admin@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mcNumber">Company MC</Label>
            <Input
              id="mcNumber"
              value={formData.mcNumber}
              onChange={(e) => handleInputChange('mcNumber', e.target.value)}
              placeholder="MC-123456"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Company Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminFirstName">User First Name</Label>
            <Input
              id="adminFirstName"
              value={formData.adminFirstName}
              onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
              placeholder="John"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminLastName">User Last Name</Label>
            <Input
              id="adminLastName"
              value={formData.adminLastName}
              onChange={(e) => handleInputChange('adminLastName', e.target.value)}
              placeholder="Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">User Email Address</Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => handleInputChange('adminEmail', e.target.value)}
              placeholder="john@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">User Phone Number</Label>
            <Input
              id="adminPhone"
              value={formData.adminPhone}
              onChange={(e) => handleInputChange('adminPhone', e.target.value)}
              placeholder="555-123-4567"
              required
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