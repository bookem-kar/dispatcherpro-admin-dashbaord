// Service abstraction interfaces - implement with Mock, Supabase, or Bubble adapters

import type {
  Company,
  PlatformUser,
  ActivityEvent,
  CompanyFilter,
  UserFilter,
  ActivityFilter,
  CreateCompanyInput,
  CreateUserInput,
  NewActivityEvent,
  BubbleCompanyStats,
  BubbleLoad,
  BubbleCompanyCreateInput
} from '@/types/domain';

export interface CompanyService {
  listCompanies(filter?: CompanyFilter): Promise<Company[]>;
  getCompany(id: string): Promise<Company | null>;
  createCompany(input: CreateCompanyInput): Promise<Company>;
  updateCompany(id: string, patch: Partial<Company>): Promise<Company>;
  suspendCompany(id: string, reason?: string): Promise<Company>;
  reinstateCompany(id: string): Promise<Company>;
}

export interface UserService {
  listUsers(filter?: UserFilter): Promise<PlatformUser[]>;
  getUser(id: string): Promise<PlatformUser | null>;
  createUser(input: CreateUserInput): Promise<PlatformUser>;
  updateUser(id: string, patch: Partial<PlatformUser>): Promise<PlatformUser>;
  suspendUser(id: string, reason?: string): Promise<PlatformUser>;
  reinstateUser(id: string): Promise<PlatformUser>;
  deleteUser(id: string): Promise<void>;
}

export interface ActivityService {
  listActivity(filter?: ActivityFilter): Promise<ActivityEvent[]>;
  logEvent(evt: NewActivityEvent): Promise<void>;
}

export interface EmailService {
  sendCompanySuspended(company: Company, reason?: string): Promise<void>;
  sendCompanyReinstated(company: Company): Promise<void>;
  sendUserInvitation(user: PlatformUser, tempPassword?: string): Promise<void>;
  sendUserSuspended(user: PlatformUser, reason?: string): Promise<void>;
  sendUserReinstated(user: PlatformUser): Promise<void>;
}

// Integration placeholder for Bubble CRM reads
export interface BubbleCRMService {
  getCompanyStats(bubbleCompanyId: string): Promise<BubbleCompanyStats>;
  getRecentLoads(bubbleCompanyId: string, limit?: number): Promise<BubbleLoad[]>;
  createCompanyInBubble(payload: BubbleCompanyCreateInput): Promise<{bubbleCompanyId: string}>;
}

// Metrics aggregation (future)
export interface MetricsService {
  getTotalCompanies(): Promise<number>;
  getActiveCompanies(): Promise<number>;
  getSuspendedCompanies(): Promise<number>;
  getTotalUsers(): Promise<number>;
  getActiveUsers(): Promise<number>;
  getRecentActivityCount(hours?: number): Promise<number>;
}