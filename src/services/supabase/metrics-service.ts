// Supabase Metrics Service - Calculate platform-wide statistics from database

import type { MetricsService } from '@/services/interfaces';
import { supabase } from '@/integrations/supabase/client';

export class SupabaseMetricsService implements MetricsService {
  async getTotalCompanies(): Promise<number> {
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching total companies:', error);
      return 0;
    }
    
    return count || 0;
  }

  async getActiveCompanies(): Promise<number> {
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching active companies:', error);
      return 0;
    }
    
    return count || 0;
  }

  async getSuspendedCompanies(): Promise<number> {
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .not('suspended_at', 'is', null);
    
    if (error) {
      console.error('Error fetching suspended companies:', error);
      return 0;
    }
    
    return count || 0;
  }

  async getTotalUsers(): Promise<number> {
    const { count, error } = await supabase
      .from('platform_users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    
    if (error) {
      console.error('Error fetching total users:', error);
      return 0;
    }
    
    return count || 0;
  }

  async getActiveUsers(): Promise<number> {
    const { count, error } = await supabase
      .from('platform_users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_suspended', false)
      .is('deleted_at', null);
    
    if (error) {
      console.error('Error fetching active users:', error);
      return 0;
    }
    
    return count || 0;
  }

  async getRecentActivityCount(hours: number = 24): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    const { count, error } = await supabase
      .from('activity_events')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', cutoff.toISOString());
    
    if (error) {
      console.error('Error fetching recent activity count:', error);
      return 0;
    }
    
    return count || 0;
  }
}