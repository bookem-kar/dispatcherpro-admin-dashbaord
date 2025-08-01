import React, { useState } from 'react';
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
import { UserRole } from '@/types/domain';
import { useCompanies } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreateUserFormData {
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | '';
}

const COMPANY_ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'company_admin', label: 'Company Administrator' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'sales', label: 'Sales' },
  { value: 'read_only', label: 'Read Only' },
];

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserFormData>({
    companyId: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '',
  });

  const [companySearch, setCompanySearch] = useState('');
  const { toast } = useToast();
  
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company?.name?.toLowerCase().includes(companySearch.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === formData.companyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.companyId || !formData.email.trim() || !formData.role) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Submit form data when user approves
    console.log('Form data ready for submission:', formData);
    
    toast({
      title: 'Form Ready',
      description: 'User form data is valid and ready for submission.',
    });
  };

  const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
    if (field === 'email') {
      setFormData(prev => ({ ...prev, [field]: value.toLowerCase().trim() }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleModalClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        companyId: '',
        email: '',
        firstName: '',
        lastName: '',
        role: '',
      });
      setCompanySearch('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to a company. They will receive invitation instructions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => handleInputChange('companyId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company">
                  {selectedCompany ? selectedCompany.name : 'Select a company'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                {loadingCompanies ? (
                  <SelectItem value="" disabled>Loading companies...</SelectItem>
                ) : filteredCompanies.length === 0 ? (
                  <SelectItem value="" disabled>No companies found</SelectItem>
                ) : (
                  filteredCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleModalClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}