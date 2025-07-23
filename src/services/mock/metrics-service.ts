// Mock Metrics Service - Calculate platform-wide statistics

import type { MetricsService } from '@/services/interfaces';
import { MockCompanyService } from './company-service';
import { MockUserService } from './user-service';
import { MockActivityService } from './activity-service';

export class MockMetricsService implements MetricsService {
  private companyService = new MockCompanyService();
  private userService = new MockUserService();
  private activityService = new MockActivityService();

  async getTotalCompanies(): Promise<number> {
    const companies = await this.companyService.listCompanies();
    return companies.length;
  }

  async getActiveCompanies(): Promise<number> {
    const companies = await this.companyService.listCompanies({ status: 'active' });
    return companies.length;
  }

  async getSuspendedCompanies(): Promise<number> {
    const companies = await this.companyService.listCompanies({ status: 'suspended' });
    return companies.length;
  }

  async getTotalUsers(): Promise<number> {
    const users = await this.userService.listUsers();
    return users.length;
  }

  async getActiveUsers(): Promise<number> {
    const users = await this.userService.listUsers({ isActive: true, isSuspended: false });
    return users.length;
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