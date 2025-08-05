// Mock Metrics Service - Calculate platform-wide statistics

import type { MetricsService } from '@/services/interfaces';
// Using hardcoded values for now since we moved to Supabase for companies
import { MockUserService } from './user-service';
import { MockActivityService } from './activity-service';

export class MockMetricsService implements MetricsService {
  private userService = new MockUserService();
  private activityService = new MockActivityService();

  async getTotalCompanies(): Promise<number> {
    // Hardcoded for now - in production this would query Supabase
    return 4;
  }

  async getActiveCompanies(): Promise<number> {
    // Hardcoded for now - in production this would query Supabase
    return 2;
  }

  async getSuspendedCompanies(): Promise<number> {
    // Hardcoded for now - in production this would query Supabase
    return 1;
  }

  async getTotalUsers(): Promise<number> {
    const result = await this.userService.listUsers();
    return result.total;
  }

  async getActiveUsers(): Promise<number> {
    const result = await this.userService.listUsers({ isActive: true, isSuspended: false });
    return result.total;
  }

  async getRecentActivityCount(hours: number = 24): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    const activity = await this.activityService.listActivity({
      startDate: cutoff.toISOString(),
      limit: 1000 // Get a large batch to count
    });
    
    return activity.length;
  }
}