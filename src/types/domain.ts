// Core domain types for DispatcherPro Platform Admin

export type CompanyStatus = 'active' | 'suspended' | 'inactive';
export type PlanTier = 'trial' | 'standard' | 'pro' | 'enterprise';
export type UserRole = 'platform_admin' | 'platform_support' | 'company_admin' | 'dispatcher' | 'sales' | 'read_only';

export interface Company {
  id: string;              // Supabase UUID
  name: string;
  companyUid: string;      // Mirrors Bubble company_uid
  companyStringUuid?: string; // Additional UUID for outside database linking
  status: CompanyStatus;
  planTier: PlanTier;
  adminUserId?: string;    // convenience pointer
  maxSeats?: number;
  activeUserCount?: number;
  createdAt: string;       // ISO
  updatedAt: string;
  suspendedAt?: string;
  suspendedReason?: string;
  lastActivityAt?: string;
  // Company details
  phoneTollFree?: string;
  phoneNumber: string;
  faxNumber?: string;
  address: string;
  email: string;
  mcNumber: string;
  website: string;
  // Admin user details
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  // integration markers (fill later)
  bubbleCompanyId?: string;  // Bubble unique id if needed
  superDispatchAcct?: string;
  centralDispatchAcct?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyId: string;      // FK to Company
  role: UserRole;
  isActive: boolean;      // platform-level
  isSuspended: boolean;   // platform override
  lastLoginAt?: string;
  lastActivityAt?: string;
  createdAt: string;
  createdByUserId?: string;
}

export interface ActivityEvent {
  id: string;
  companyId: string;
  userId?: string;
  type: string; // 'login' | 'create_order' | 'company.suspended' | etc
  targetType?: string; // 'order' | 'user' | 'company' | etc
  targetId?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

// Filter types for service methods
export interface CompanyFilter {
  status?: CompanyStatus;
  planTier?: PlanTier;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserFilter {
  companyId?: string;
  role?: UserRole;
  isActive?: boolean;
  isSuspended?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActivityFilter {
  companyId?: string;
  userId?: string;
  type?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Input types for creation
export interface CreateCompanyInput {
  name: string;
  phoneTollFree?: string;
  phoneNumber: string;
  faxNumber?: string;
  address: string;
  email: string;
  mcNumber: string;
  website: string;
  // Admin user details
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
}

export interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  companyId: string;
  role: UserRole;
  createdByUserId?: string;
}

export interface NewActivityEvent {
  companyId: string;
  userId?: string;
  type: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, any>;
}

// Integration types (for future Bubble integration)
export interface BubbleCompanyStats {
  totalLoads: number;
  activeDrivers: number;
  monthlyRevenue?: number;
  lastSyncAt: string;
}

export interface BubbleLoad {
  id: string;
  loadNumber: string;
  status: string;
  pickupDate?: string;
  deliveryDate?: string;
  revenue?: number;
}

export interface BubbleCompanyCreateInput {
  name: string;
  adminEmail: string;
  planTier: PlanTier;
}