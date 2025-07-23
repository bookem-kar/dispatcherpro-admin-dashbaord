// Mock Company Service - In-memory CRUD operations

import type { 
  Company, 
  CompanyFilter, 
  CreateCompanyInput,
  NewActivityEvent 
} from '@/types/domain';
import type { CompanyService } from '@/services/interfaces';
import { mockCompanies, getMockCompany } from '@/data/mock-fixtures';
import { MockActivityService } from './activity-service';

export class MockCompanyService implements CompanyService {
  private companies: Company[] = [...mockCompanies];
  private activityService = new MockActivityService();

  async listCompanies(filter?: CompanyFilter): Promise<Company[]> {
    let result = [...this.companies];

    // Apply filters
    if (filter?.status) {
      result = result.filter(c => c.status === filter.status);
    }
    
    if (filter?.planTier) {
      result = result.filter(c => c.planTier === filter.planTier);
    }
    
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.companyUid.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return result.slice(start, end);
  }

  async getCompany(id: string): Promise<Company | null> {
    const company = this.companies.find(c => c.id === id);
    return company || null;
  }

  async createCompany(input: CreateCompanyInput): Promise<Company> {
    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name: input.name,
      companyUid: input.companyUid,
      status: 'trial', // New companies start on trial
      planTier: input.planTier,
      adminUserId: input.adminUserId,
      maxSeats: input.maxSeats || 10,
      activeUserCount: 0,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    this.companies.push(newCompany);

    // Log activity
    await this.activityService.logEvent({
      companyId: newCompany.id,
      type: 'company.created',
      targetType: 'company',
      targetId: newCompany.id,
      meta: { 
        planTier: input.planTier,
        adminUserId: input.adminUserId,
        createdBy: 'platform_admin' // In real app, get from auth context
      }
    });

    return newCompany;
  }

  async updateCompany(id: string, patch: Partial<Company>): Promise<Company> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Company with id ${id} not found`);
    }

    const updated = {
      ...this.companies[index],
      ...patch,
      lastActivityAt: new Date().toISOString()
    };

    this.companies[index] = updated;

    // Log significant changes
    if (patch.planTier || patch.maxSeats || patch.status) {
      await this.activityService.logEvent({
        companyId: id,
        type: 'company.updated',
        targetType: 'company',
        targetId: id,
        meta: { 
          changes: patch,
          updatedBy: 'platform_admin'
        }
      });
    }

    return updated;
  }

  async suspendCompany(id: string, reason?: string): Promise<Company> {
    const company = await this.getCompany(id);
    if (!company) {
      throw new Error(`Company with id ${id} not found`);
    }

    const suspended = await this.updateCompany(id, {
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
      suspendedReason: reason || 'Administrative action'
    });

    // Log suspension
    await this.activityService.logEvent({
      companyId: id,
      type: 'company.suspended',
      targetType: 'company',
      targetId: id,
      meta: { 
        reason: reason || 'Administrative action',
        suspendedBy: 'platform_admin'
      }
    });

    return suspended;
  }

  async reinstateCompany(id: string): Promise<Company> {
    const company = await this.getCompany(id);
    if (!company) {
      throw new Error(`Company with id ${id} not found`);
    }

    const reinstated = await this.updateCompany(id, {
      status: 'active',
      suspendedAt: undefined,
      suspendedReason: undefined
    });

    // Log reinstatement
    await this.activityService.logEvent({
      companyId: id,
      type: 'company.reinstated',
      targetType: 'company',
      targetId: id,
      meta: { 
        reinstatedBy: 'platform_admin'
      }
    });

    return reinstated;
  }

  // Helper methods for testing/dev
  reset(): void {
    this.companies = [...mockCompanies];
  }

  getAll(): Company[] {
    return [...this.companies];
  }
}