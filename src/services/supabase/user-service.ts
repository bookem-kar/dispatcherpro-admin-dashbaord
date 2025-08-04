import { supabase } from '@/integrations/supabase/client';
import type { UserService } from '@/services/interfaces';
import type { PlatformUser, CreateUserInput, UserFilter } from '@/types/domain';

// Helper function to transform Supabase user data to domain model
function transformSupabaseUser(user: any): PlatformUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    companyId: user.company_id,
    role: user.role,
    isActive: user.is_active,
    isSuspended: user.is_suspended,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
    lastActivityAt: user.last_activity_at,
    createdByUserId: user.created_by_user_id,
  };
}

export class SupabaseUserService implements UserService {
  async listUsers(filter?: UserFilter): Promise<PlatformUser[]> {
    let query = supabase.from('platform_users').select('*');
    
    if (filter?.companyId) {
      query = query.eq('company_id', filter.companyId);
    }
    
    if (filter?.role) {
      query = query.eq('role', filter.role);
    }
    
    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }
    
    if (filter?.isSuspended !== undefined) {
      query = query.eq('is_suspended', filter.isSuspended);
    }
    
    if (filter?.search) {
      query = query.or(`email.ilike.%${filter.search}%,first_name.ilike.%${filter.search}%,last_name.ilike.%${filter.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    return (data || []).map(transformSupabaseUser);
  }

  async getUser(id: string): Promise<PlatformUser | null> {
    const { data, error } = await supabase
      .from('platform_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    
    return transformSupabaseUser(data);
  }

  async createUser(input: CreateUserInput): Promise<PlatformUser> {
    // Call the create-user-webhook edge function
    const { data, error } = await supabase.functions.invoke('create-user-webhook', {
      body: {
        companyId: input.companyId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        role: input.role,
      },
    });

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    if (!data?.user) {
      throw new Error('User creation failed: No user data returned');
    }

    return data.user;
  }

  async updateUser(id: string, patch: Partial<PlatformUser>): Promise<PlatformUser> {
    const { data, error } = await supabase
      .from('platform_users')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    return transformSupabaseUser(data);
  }

  async suspendUser(id: string, reason?: string): Promise<PlatformUser> {
    const { data, error } = await supabase
      .from('platform_users')
      .update({ 
        is_suspended: true, 
        suspended_at: new Date().toISOString(),
        suspension_reason: reason 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to suspend user: ${error.message}`);
    }
    
    return transformSupabaseUser(data);
  }

  async reinstateUser(id: string): Promise<PlatformUser> {
    const { data, error } = await supabase
      .from('platform_users')
      .update({ 
        is_suspended: false, 
        suspended_at: null,
        suspension_reason: null 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to reinstate user: ${error.message}`);
    }
    
    return transformSupabaseUser(data);
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('platform_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}