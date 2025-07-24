import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ApiCredential {
  id: string;
  user_id: string;
  credential_type: 'bubble_io' | 'n8n';
  credential_name: string;
  base_url?: string;
  api_key?: string;
  webhook_url?: string;
  auth_token?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCredentialInput {
  credential_type: 'bubble_io' | 'n8n';
  credential_name: string;
  base_url?: string;
  api_key?: string;
  webhook_url?: string;
  auth_token?: string;
}

export interface UpdateCredentialInput {
  id: string;
  credential_name?: string;
  base_url?: string;
  api_key?: string;
  webhook_url?: string;
  auth_token?: string;
  is_active?: boolean;
}

export function useApiCredentials() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch API credentials
  const { data: credentials, isLoading } = useQuery({
    queryKey: ['api-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiCredential[];
    }
  });

  // Create new credential
  const createCredential = useMutation({
    mutationFn: async (input: CreateCredentialInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('api_credentials')
        .insert({
          user_id: user.id,
          ...input
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-credentials'] });
      toast({
        title: "Success",
        description: "API credentials saved successfully."
      });
    },
    onError: (error) => {
      console.error('Error creating credential:', error);
      toast({
        title: "Error",
        description: "Failed to save API credentials.",
        variant: "destructive"
      });
    }
  });

  // Update existing credential
  const updateCredential = useMutation({
    mutationFn: async (input: UpdateCredentialInput) => {
      const { id, ...updateData } = input;
      const { data, error } = await supabase
        .from('api_credentials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-credentials'] });
      toast({
        title: "Success",
        description: "API credentials updated successfully."
      });
    },
    onError: (error) => {
      console.error('Error updating credential:', error);
      toast({
        title: "Error",
        description: "Failed to update API credentials.",
        variant: "destructive"
      });
    }
  });

  // Delete credential
  const deleteCredential = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_credentials')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-credentials'] });
      toast({
        title: "Success",
        description: "API credentials deleted successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting credential:', error);
      toast({
        title: "Error",
        description: "Failed to delete API credentials.",
        variant: "destructive"
      });
    }
  });

  return {
    credentials,
    isLoading,
    createCredential,
    updateCredential,
    deleteCredential
  };
}