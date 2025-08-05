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
  async listUsers(filter?: UserFilter): Promise<{ users: PlatformUser[]; total: number }> {
    let query = supabase.from('platform_users').select('*', { count: 'exact' });
    
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

    // Add sorting - default to newest first
    const sortBy = filter?.sortBy || 'created_at';
    const sortOrder = filter?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    return {
      users: (data || []).map(transformSupabaseUser),
      total: count || 0
    };
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

  async createUser(input: CreateUserInput): Promise<{ success: boolean; message?: string }> {
    console.log('Triggering user creation webhook:', input);
    
    const { data, error } = await supabase.functions.invoke('create-user-webhook', {
      body: input
    });

    if (error) {
      console.error('Error triggering user creation webhook:', error);
      throw new Error(`Failed to trigger user creation: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error('User creation webhook failed');
    }

    return {
      success: true,
      message: 'User creation webhook triggered successfully'
    };
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
    console.log('Starting suspendUser process for ID:', id, 'with reason:', reason);
    
    try {
      console.log('Attempting to update platform_users table...');
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
        console.error('Database update error:', error);
        throw new Error(`Failed to suspend user: ${error.message}`);
      }
      
      console.log('Database update successful. User data:', data);
      console.log('User company_id:', data.company_id);

      // Get user's company_uid for external API sync
      console.log('Fetching company data...');
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('company_uid')
        .eq('id', data.company_id)
        .single();

      if (companyError) {
        console.error('Company fetch error:', companyError);
      } else {
        console.log('Company data fetched:', companyData);
      }

      // Sync with external Bubble.io API
      try {
        if (companyData?.company_uid) {
          console.log('Calling sync-user-status edge function with:', {
            company_uid: companyData.company_uid,
            email: data.email,
            active_status: 'inactive'
          });
          
          const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-user-status', {
            body: { 
              company_uid: companyData.company_uid,
              email: data.email,
              active_status: 'inactive'
            }
          });
          
          if (syncError) {
            console.error('Edge function invocation error:', syncError);
          } else {
            console.log('Edge function response:', syncData);
            console.log('User status synced with external API successfully');
          }
        } else {
          console.warn('No company_uid found, skipping external sync');
        }
      } catch (syncError) {
        console.error('Failed to sync user status with external API:', syncError);
        // Don't fail the operation if external sync fails
      }
      
      return transformSupabaseUser(data);
    } catch (mainError) {
      console.error('Main suspendUser error:', mainError);
      throw mainError;
    }
  }

  async reinstateUser(id: string): Promise<PlatformUser> {
    console.log('Starting reinstateUser process for ID:', id);
    
    try {
      console.log('Attempting to update platform_users table...');
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
        console.error('Database update error:', error);
        throw new Error(`Failed to reinstate user: ${error.message}`);
      }
      
      console.log('Database update successful. User data:', data);
      console.log('User company_id:', data.company_id);

      // Get user's company_uid for external API sync
      console.log('Fetching company data...');
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('company_uid')
        .eq('id', data.company_id)
        .single();

      if (companyError) {
        console.error('Company fetch error:', companyError);
      } else {
        console.log('Company data fetched:', companyData);
      }

      // Sync with external Bubble.io API
      try {
        if (companyData?.company_uid) {
          console.log('Calling sync-user-status edge function with:', {
            company_uid: companyData.company_uid,
            email: data.email,
            active_status: 'active'
          });
          
          const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-user-status', {
            body: { 
              company_uid: companyData.company_uid,
              email: data.email,
              active_status: 'active'
            }
          });
          
          if (syncError) {
            console.error('Edge function invocation error:', syncError);
          } else {
            console.log('Edge function response:', syncData);
            console.log('User status synced with external API successfully');
          }
        } else {
          console.warn('No company_uid found, skipping external sync');
        }
      } catch (syncError) {
        console.error('Failed to sync user status with external API:', syncError);
        // Don't fail the operation if external sync fails
      }
      
      return transformSupabaseUser(data);
    } catch (mainError) {
      console.error('Main reinstateUser error:', mainError);
      throw mainError;
    }
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