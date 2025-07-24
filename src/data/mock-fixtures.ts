// Mock data for development and testing
import type { PlatformUser, ActivityEvent } from '@/types/domain';

export const mockUsers: PlatformUser[] = [
  {
    id: 'user-1',
    email: 'john.doe@acmetrans.com',
    firstName: 'John',
    lastName: 'Doe',
    companyId: 'comp-1',
    role: 'company_admin',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-01-15T09:30:00Z',
    lastActivityAt: '2024-01-15T14:45:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'sarah.wilson@globaldispatch.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    companyId: 'comp-2',
    role: 'dispatcher',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-01-15T08:15:00Z',
    lastActivityAt: '2024-01-15T16:20:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'mike.chen@fastfreight.com',
    firstName: 'Mike',
    lastName: 'Chen',
    companyId: 'comp-3',
    role: 'company_admin',
    isActive: false,
    isSuspended: true,
    lastLoginAt: '2024-01-10T10:00:00Z',
    lastActivityAt: '2024-01-10T11:30:00Z',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'activity-1',
    companyId: 'comp-1',
    userId: 'user-1',
    type: 'login',
    timestamp: '2024-01-15T14:45:00Z',
    meta: { ip: '192.168.1.100', userAgent: 'Chrome/120.0' }
  },
  {
    id: 'activity-2',
    companyId: 'comp-2',
    userId: 'user-2',
    type: 'create_order',
    targetType: 'order',
    targetId: 'order-123',
    timestamp: '2024-01-15T16:20:00Z',
    meta: { orderNumber: 'ORD-2024-001', amount: 2500 }
  },
  {
    id: 'activity-3',
    companyId: 'comp-3',
    type: 'company.suspended',
    timestamp: '2024-01-14T09:00:00Z',
    meta: { reason: 'Payment overdue', suspendedBy: 'admin-1' }
  },
];