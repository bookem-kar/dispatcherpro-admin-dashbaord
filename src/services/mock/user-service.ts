// Mock User Service - In-memory CRUD operations

import type { 
  PlatformUser, 
  UserFilter, 
  CreateUserInput,
  NewActivityEvent 
} from '@/types/domain';
import type { UserService } from '@/services/interfaces';
import { mockUsers, getMockUser } from '@/data/mock-fixtures';
import { MockActivityService } from './activity-service';

export class MockUserService implements UserService {
  private users: PlatformUser[] = [...mockUsers];
  private activityService = new MockActivityService();

  async listUsers(filter?: UserFilter): Promise<PlatformUser[]> {
    let result = [...this.users];

    // Apply filters
    if (filter?.companyId) {
      result = result.filter(u => u.companyId === filter.companyId);
    }
    
    if (filter?.role) {
      result = result.filter(u => u.role === filter.role);
    }
    
    if (filter?.isActive !== undefined) {
      result = result.filter(u => u.isActive === filter.isActive);
    }
    
    if (filter?.isSuspended !== undefined) {
      result = result.filter(u => u.isSuspended === filter.isSuspended);
    }
    
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(u => 
        u.email.toLowerCase().includes(search) ||
        (u.firstName && u.firstName.toLowerCase().includes(search)) ||
        (u.lastName && u.lastName.toLowerCase().includes(search)) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return result.slice(start, end);
  }

  async getUser(id: string): Promise<PlatformUser | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async createUser(input: CreateUserInput): Promise<PlatformUser> {
    const newUser: PlatformUser = {
      id: `user-${Date.now()}`,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      companyId: input.companyId,
      role: input.role,
      isActive: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      createdByUserId: input.createdByUserId
    };

    this.users.push(newUser);

    // Log activity
    await this.activityService.logEvent({
      companyId: newUser.companyId,
      userId: input.createdByUserId,
      type: 'user.created',
      targetType: 'user',
      targetId: newUser.id,
      meta: { 
        role: input.role,
        email: input.email,
        createdBy: input.createdByUserId
      }
    });

    return newUser;
  }

  async updateUser(id: string, patch: Partial<PlatformUser>): Promise<PlatformUser> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const updated = {
      ...this.users[index],
      ...patch,
      lastActivityAt: new Date().toISOString()
    };

    this.users[index] = updated;

    // Log significant changes
    if (patch.role || patch.isActive !== undefined || patch.isSuspended !== undefined) {
      await this.activityService.logEvent({
        companyId: updated.companyId,
        type: 'user.updated',
        targetType: 'user',
        targetId: id,
        meta: { 
          changes: patch,
          updatedBy: 'platform_admin'
        }
      });
    }

    return updated;
  }

  async suspendUser(id: string, reason?: string): Promise<PlatformUser> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const suspended = await this.updateUser(id, {
      isActive: false,
      isSuspended: true
    });

    // Log suspension
    await this.activityService.logEvent({
      companyId: user.companyId,
      type: 'user.suspended',
      targetType: 'user',
      targetId: id,
      meta: { 
        reason: reason || 'Administrative action',
        suspendedBy: 'platform_admin'
      }
    });

    return suspended;
  }

  async reinstateUser(id: string): Promise<PlatformUser> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const reinstated = await this.updateUser(id, {
      isActive: true,
      isSuspended: false
    });

    // Log reinstatement
    await this.activityService.logEvent({
      companyId: user.companyId,
      type: 'user.reinstated',
      targetType: 'user',
      targetId: id,
      meta: { 
        reinstatedBy: 'platform_admin'
      }
    });

    return reinstated;
  }

  async deleteUser(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const user = this.users[userIndex];
    this.users.splice(userIndex, 1);

    // Log deletion
    await this.activityService.logEvent({
      companyId: user.companyId,
      type: 'user.deleted',
      targetType: 'user',
      targetId: id,
      meta: { 
        deletedUser: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        deletedBy: 'platform_admin'
      }
    });
  }

  // Helper methods for testing/dev
  reset(): void {
    this.users = [...mockUsers];
  }

  getAll(): PlatformUser[] {
    return [...this.users];
  }

  getUsersByCompany(companyId: string): Promise<PlatformUser[]> {
    return this.listUsers({ companyId });
  }
}