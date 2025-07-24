// React Query hooks for Company data management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanyService, useEmailService } from '@/providers/service-provider';
import type { CompanyFilter, CreateCompanyInput } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useCompanies(filter?: CompanyFilter) {
  const companyService = useCompanyService();
  
  return useQuery({
    queryKey: ['companies', filter],
    queryFn: () => companyService.listCompanies(filter),
    staleTime: 30000, // 30 seconds
  });
}

export function useCompany(id: string) {
  const companyService = useCompanyService();
  
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companyService.getCompany(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateCompanyInput) => {
      // Only call the webhook - n8n will handle company creation
      console.log('Calling webhook with form data:', input);
      const webhookResponse = await supabase.functions.invoke('call-company-webhook', {
        body: input
      });
      
      if (webhookResponse.error) {
        throw new Error(`Webhook call failed: ${webhookResponse.error.message}`);
      }
      
      console.log('Webhook called successfully:', webhookResponse.data);
      return webhookResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast({
        title: 'Company Submission Sent',
        description: 'Company information has been submitted successfully. They will receive activation instructions.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit company information. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useSuspendCompany() {
  const companyService = useCompanyService();
  const emailService = useEmailService();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const company = await companyService.suspendCompany(id, reason);
      
      // Send notification email
      try {
        await emailService.sendCompanySuspended(company, reason);
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't fail the whole operation if email fails
      }
      
      return company;
    },
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      
      toast({
        title: 'Company Suspended',
        description: `${company.name} has been suspended.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to suspend company. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useReinstateCompany() {
  const companyService = useCompanyService();
  const emailService = useEmailService();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const company = await companyService.reinstateCompany(id);
      
      // Send notification email
      try {
        await emailService.sendCompanyReinstated(company);
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }
      
      return company;
    },
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      
      toast({
        title: 'Company Reinstated',
        description: `${company.name} has been reinstated.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reinstate company. Please try again.',
        variant: 'destructive',
      });
    },
  });
}