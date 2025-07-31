import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateCompany } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Company, PlanTier, CompanyStatus } from '@/types/domain';

const editCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  phoneTollFree: z.string().optional(),
  faxNumber: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  website: z.string().min(1, 'Website is required'),
  mcNumber: z.string().min(1, 'MC Number is required'),
  planTier: z.enum(['trial', 'standard', 'pro', 'enterprise'] as const),
  status: z.enum(['active', 'inactive', 'suspended'] as const),
  maxSeats: z.number().min(1).optional(),
  adminFirstName: z.string().min(1, 'Admin first name is required'),
  adminLastName: z.string().min(1, 'Admin last name is required'),
  adminEmail: z.string().email('Invalid admin email address'),
  adminPhone: z.string().min(1, 'Admin phone is required'),
  adminUserId: z.string().optional(),
  bubbleCompanyId: z.string().optional(),
  superDispatchAcct: z.string().optional(),
  centralDispatchAcct: z.string().optional(),
});

type EditCompanyFormData = z.infer<typeof editCompanySchema>;

interface EditCompanyModalProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCompanyModal({ company, open, onOpenChange }: EditCompanyModalProps) {
  const { toast } = useToast();
  const updateCompany = useUpdateCompany();

  const form = useForm<EditCompanyFormData>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      name: company.name,
      email: company.email,
      phoneNumber: company.phoneNumber,
      phoneTollFree: company.phoneTollFree || '',
      faxNumber: company.faxNumber || '',
      address: company.address,
      website: company.website,
      mcNumber: company.mcNumber,
      planTier: company.planTier,
      status: company.status,
      maxSeats: company.maxSeats || undefined,
      adminFirstName: company.adminFirstName,
      adminLastName: company.adminLastName,
      adminEmail: company.adminEmail,
      adminPhone: company.adminPhone,
      adminUserId: company.adminUserId || '',
      bubbleCompanyId: company.bubbleCompanyId || '',
      superDispatchAcct: company.superDispatchAcct || '',
      centralDispatchAcct: company.centralDispatchAcct || '',
    },
  });

  const onSubmit = async (data: EditCompanyFormData) => {
    try {
      // Filter out empty optional fields
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== undefined)
      );

      await updateCompany.mutateAsync({
        id: company.id,
        data: updateData,
      });

      // Sync with external system after successful update
      try {
        await supabase.functions.invoke('sync-company-update', {
          body: {
            companyId: company.id,
            updateData: data
          }
        });
        console.log('Company update synced with external system');
      } catch (syncError) {
        console.warn('Failed to sync company update with external system:', syncError);
        // Don't fail the whole operation if sync fails
      }

      toast({
        title: 'Company Updated',
        description: `${data.name} has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company Details</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mcNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MC Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Seats</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneTollFree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toll Free Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fax Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Admin Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Admin User Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adminFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin User ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Integration Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Integration Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bubbleCompanyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bubble Company ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="superDispatchAcct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SuperDispatch Account</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="centralDispatchAcct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CentralDispatch Account</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateCompany.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCompany.isPending}>
                {updateCompany.isPending ? 'Updating...' : 'Update Company'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}