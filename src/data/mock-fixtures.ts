// Mock data fixtures for development and testing

import type { Company, PlatformUser, ActivityEvent } from '@/types/domain';

export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'ABC Logistics',
    companyUid: 'abc-logistics-001',
    status: 'active',
    planTier: 'pro',
    adminUserId: 'user-1',
    maxSeats: 50,
    activeUserCount: 23,
    createdAt: '2024-01-15T08:00:00Z',
    lastActivityAt: '2024-07-22T14:30:00Z',
    phoneNumber: '555-123-4567',
    address: '123 Main St, Chicago, IL 60601',
    email: 'admin@abclogistics.com',
    mcNumber: 'MC-123456',
    website: 'https://abclogistics.com',
    phoneTollFree: '800-555-0123',
    bubbleCompanyId: 'bubble-abc-001',
    superDispatchAcct: 'abc-super-disp'
  },
  {
    id: 'comp-2',
    name: 'FastTrack Freight',
    companyUid: 'fasttrack-freight-002',
    status: 'active',
    planTier: 'enterprise',
    adminUserId: 'user-4',
    maxSeats: 100,
    activeUserCount: 67,
    createdAt: '2024-02-03T10:15:00Z',
    lastActivityAt: '2024-07-23T09:45:00Z',
    phoneNumber: '555-234-5678',
    address: '456 Oak Ave, Dallas, TX 75201',
    email: 'contact@fasttrackfreight.com',
    mcNumber: 'MC-234567',
    website: 'https://fasttrackfreight.com',
    bubbleCompanyId: 'bubble-fast-002'
  },
  {
    id: 'comp-3',
    name: 'Metro Dispatch Co',
    companyUid: 'metro-dispatch-003',
    status: 'suspended',
    planTier: 'standard',
    adminUserId: 'user-7',
    maxSeats: 25,
    activeUserCount: 12,
    createdAt: '2024-03-10T14:20:00Z',
    suspendedAt: '2024-07-20T16:00:00Z',
    suspendedReason: 'Payment overdue - 30 days',
    lastActivityAt: '2024-07-19T11:22:00Z',
    phoneNumber: '555-345-6789',
    address: '789 Pine St, Atlanta, GA 30309',
    email: 'info@metrodispatch.com',
    mcNumber: 'MC-345678',
    website: 'https://metrodispatch.com',
    faxNumber: '555-345-6790',
    bubbleCompanyId: 'bubble-metro-003'
  },
  {
    id: 'comp-4',
    name: 'Highway Heroes LLC',
    companyUid: 'highway-heroes-004',
    status: 'trial',
    planTier: 'trial',
    adminUserId: 'user-10',
    maxSeats: 10,
    activeUserCount: 5,
    createdAt: '2024-07-18T09:30:00Z',
    lastActivityAt: '2024-07-23T08:15:00Z',
    phoneNumber: '555-456-7890',
    address: '321 Elm St, Phoenix, AZ 85001',
    email: 'admin@highwayheroes.com',
    mcNumber: 'MC-456789',
    website: 'https://highwayheroes.com'
  },
  {
    id: 'comp-5',
    name: 'Elite Transport Solutions',
    companyUid: 'elite-transport-005',
    status: 'active',
    planTier: 'pro',
    adminUserId: 'user-13',
    maxSeats: 75,
    activeUserCount: 41,
    createdAt: '2023-11-22T11:45:00Z',
    lastActivityAt: '2024-07-23T13:20:00Z',
    phoneNumber: '555-567-8901',
    address: '654 Maple Dr, Denver, CO 80202',
    email: 'contact@elitetransport.com',
    mcNumber: 'MC-567890',
    website: 'https://elitetransport.com',
    phoneTollFree: '800-555-0456',
    bubbleCompanyId: 'bubble-elite-005',
    centralDispatchAcct: 'elite-central-disp'
  }
];

export const mockUsers: PlatformUser[] = [
  {
    id: 'user-1',
    email: 'admin@abclogistics.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    companyId: 'comp-1',
    role: 'company_admin',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T07:30:00Z',
    lastActivityAt: '2024-07-23T14:30:00Z',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'user-2',
    email: 'platform.admin@dispatcherpro.com',
    firstName: 'Mike',
    lastName: 'Chen',
    companyId: 'comp-internal',
    role: 'platform_admin',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T06:00:00Z',
    lastActivityAt: '2024-07-23T15:45:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'support@dispatcherpro.com',
    firstName: 'Lisa',
    lastName: 'Rodriguez',
    companyId: 'comp-internal',
    role: 'platform_support',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T08:15:00Z',
    lastActivityAt: '2024-07-23T12:20:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-4',
    email: 'ceo@fasttrackfreight.com',
    firstName: 'David',
    lastName: 'Wilson',
    companyId: 'comp-2',
    role: 'company_admin',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T05:45:00Z',
    lastActivityAt: '2024-07-23T09:45:00Z',
    createdAt: '2024-02-03T10:15:00Z'
  },
  {
    id: 'user-5',
    email: 'dispatcher1@fasttrackfreight.com',
    firstName: 'Jennifer',
    lastName: 'Brown',
    companyId: 'comp-2',
    role: 'dispatcher',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-22T14:20:00Z',
    lastActivityAt: '2024-07-22T18:30:00Z',
    createdAt: '2024-02-10T09:00:00Z'
  },
  {
    id: 'user-6',
    email: 'sales@fasttrackfreight.com',
    firstName: 'Robert',
    lastName: 'Davis',
    companyId: 'comp-2',
    role: 'sales',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-21T11:30:00Z',
    lastActivityAt: '2024-07-21T16:45:00Z',
    createdAt: '2024-02-15T13:30:00Z'
  },
  {
    id: 'user-7',
    email: 'owner@metrodispatch.com',
    firstName: 'Amanda',
    lastName: 'Garcia',
    companyId: 'comp-3',
    role: 'company_admin',
    isActive: false,
    isSuspended: true,
    lastLoginAt: '2024-07-19T10:15:00Z',
    lastActivityAt: '2024-07-19T11:22:00Z',
    createdAt: '2024-03-10T14:20:00Z'
  },
  {
    id: 'user-8',
    email: 'dispatch@metrodispatch.com',
    firstName: 'Carlos',
    lastName: 'Martinez',
    companyId: 'comp-3',
    role: 'dispatcher',
    isActive: false,
    isSuspended: true,
    lastLoginAt: '2024-07-18T15:45:00Z',
    lastActivityAt: '2024-07-18T17:20:00Z',
    createdAt: '2024-03-15T11:00:00Z'
  },
  {
    id: 'user-9',
    email: 'readonly@metrodispatch.com',
    firstName: 'Patricia',
    lastName: 'Lee',
    companyId: 'comp-3',
    role: 'read_only',
    isActive: false,
    isSuspended: true,
    lastLoginAt: '2024-07-17T09:30:00Z',
    lastActivityAt: '2024-07-17T12:15:00Z',
    createdAt: '2024-03-20T16:45:00Z'
  },
  {
    id: 'user-10',
    email: 'trial@highwayheroes.com',
    firstName: 'Kevin',
    lastName: 'Thompson',
    companyId: 'comp-4',
    role: 'company_admin',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T08:00:00Z',
    lastActivityAt: '2024-07-23T08:15:00Z',
    createdAt: '2024-07-18T09:30:00Z'
  },
  {
    id: 'user-11',
    email: 'test1@highwayheroes.com',
    firstName: 'Emily',
    lastName: 'Clark',
    companyId: 'comp-4',
    role: 'dispatcher',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-22T16:30:00Z',
    lastActivityAt: '2024-07-22T18:45:00Z',
    createdAt: '2024-07-19T12:15:00Z'
  },
  {
    id: 'user-12',
    email: 'test2@highwayheroes.com',
    firstName: 'Jason',
    lastName: 'White',
    companyId: 'comp-4',
    role: 'sales',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-21T13:45:00Z',
    lastActivityAt: '2024-07-21T15:30:00Z',
    createdAt: '2024-07-20T10:00:00Z'
  },
  {
    id: 'user-13',
    email: 'admin@elitetransport.com',
    firstName: 'Michelle',
    lastName: 'Anderson',
    companyId: 'comp-5',
    role: 'company_admin',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T06:45:00Z',
    lastActivityAt: '2024-07-23T13:20:00Z',
    createdAt: '2023-11-22T11:45:00Z'
  },
  {
    id: 'user-14',
    email: 'ops@elitetransport.com',
    firstName: 'Brian',
    lastName: 'Taylor',
    companyId: 'comp-5',
    role: 'dispatcher',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-22T12:20:00Z',
    lastActivityAt: '2024-07-22T17:45:00Z',
    createdAt: '2023-12-01T09:30:00Z'
  },
  {
    id: 'user-15',
    email: 'bizdev@elitetransport.com',
    firstName: 'Nicole',
    lastName: 'Moore',
    companyId: 'comp-5',
    role: 'sales',
    isActive: true,
    isSuspended: false,
    lastLoginAt: '2024-07-23T10:15:00Z',
    lastActivityAt: '2024-07-23T11:30:00Z',
    createdAt: '2023-12-15T14:20:00Z'
  }
];

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'evt-1',
    companyId: 'comp-3',
    userId: 'user-2',
    type: 'company.suspended',
    targetType: 'company',
    targetId: 'comp-3',
    meta: { reason: 'Payment overdue - 30 days', suspendedBy: 'user-2' },
    timestamp: '2024-07-20T16:00:00Z'
  },
  {
    id: 'evt-2',
    companyId: 'comp-4',
    userId: 'user-10',
    type: 'user.login',
    targetType: 'user',
    targetId: 'user-10',
    meta: { ip: '192.168.1.100', userAgent: 'Chrome/125.0' },
    timestamp: '2024-07-23T08:00:00Z'
  },
  {
    id: 'evt-3',
    companyId: 'comp-1',
    userId: 'user-1',
    type: 'user.created',
    targetType: 'user',
    targetId: 'user-16',
    meta: { role: 'dispatcher', createdBy: 'user-1' },
    timestamp: '2024-07-23T10:30:00Z'
  },
  {
    id: 'evt-4',
    companyId: 'comp-2',
    userId: 'user-4',
    type: 'user.login',
    targetType: 'user',
    targetId: 'user-4',
    meta: { ip: '10.0.1.50', userAgent: 'Chrome/125.0' },
    timestamp: '2024-07-23T05:45:00Z'
  },
  {
    id: 'evt-5',
    companyId: 'comp-4',
    userId: 'user-2',
    type: 'company.created',
    targetType: 'company',
    targetId: 'comp-4',
    meta: { planTier: 'trial', createdBy: 'user-2' },
    timestamp: '2024-07-18T09:30:00Z'
  },
  {
    id: 'evt-6',
    companyId: 'comp-5',
    userId: 'user-13',
    type: 'user.login',
    targetType: 'user',
    targetId: 'user-13',
    meta: { ip: '172.16.0.25', userAgent: 'Firefox/126.0' },
    timestamp: '2024-07-23T06:45:00Z'
  },
  {
    id: 'evt-7',
    companyId: 'comp-1',
    userId: 'user-1',
    type: 'user.login',
    targetType: 'user',
    targetId: 'user-1',
    meta: { ip: '192.168.1.75', userAgent: 'Safari/17.0' },
    timestamp: '2024-07-23T07:30:00Z'
  },
  {
    id: 'evt-8',
    companyId: 'comp-3',
    userId: 'user-2',
    type: 'user.suspended',
    targetType: 'user',
    targetId: 'user-7',
    meta: { reason: 'Company suspension', suspendedBy: 'user-2' },
    timestamp: '2024-07-20T16:05:00Z'
  },
  {
    id: 'evt-9',
    companyId: 'comp-3',
    userId: 'user-2',
    type: 'user.suspended',
    targetType: 'user',
    targetId: 'user-8',
    meta: { reason: 'Company suspension', suspendedBy: 'user-2' },
    timestamp: '2024-07-20T16:06:00Z'
  },
  {
    id: 'evt-10',
    companyId: 'comp-3',
    userId: 'user-2',
    type: 'user.suspended',
    targetType: 'user',
    targetId: 'user-9',
    meta: { reason: 'Company suspension', suspendedBy: 'user-2' },
    timestamp: '2024-07-20T16:07:00Z'
  },
  {
    id: 'evt-11',
    companyId: 'comp-2',
    userId: 'user-5',
    type: 'user.login',
    targetType: 'user',
    targetId: 'user-5',
    meta: { ip: '10.0.1.55', userAgent: 'Chrome/125.0' },
    timestamp: '2024-07-22T14:20:00Z'
  },
  {
    id: 'evt-12',
    companyId: 'comp-5',
    userId: 'user-15',
    type: 'user.login',
    targetType: 'user',
    targetId: 'user-15',
    meta: { ip: '172.16.0.30', userAgent: 'Edge/125.0' },
    timestamp: '2024-07-23T10:15:00Z'
  }
];

// Helper function to get mock data by ID
export const getMockCompany = (id: string): Company | undefined => 
  mockCompanies.find(c => c.id === id);

export const getMockUser = (id: string): PlatformUser | undefined => 
  mockUsers.find(u => u.id === id);

export const getMockUsersByCompany = (companyId: string): PlatformUser[] => 
  mockUsers.filter(u => u.companyId === companyId);

// Generate additional mock activity for realistic feeds
export const generateMockActivity = (count: number = 50): ActivityEvent[] => {
  const baseEvents = [...mockActivityEvents];
  const eventTypes = ['user.login', 'user.logout', 'order.created', 'order.updated', 'report.generated'];
  const companies = mockCompanies.map(c => c.id);
  const users = mockUsers.map(u => u.id);
  
  for (let i = 0; i < count; i++) {
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Generate timestamp within last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const randomTime = new Date(weekAgo.getTime() + Math.random() * (now.getTime() - weekAgo.getTime()));
    
    baseEvents.push({
      id: `evt-gen-${i}`,
      companyId: randomCompany,
      userId: randomUser,
      type: randomEvent,
      targetType: randomEvent.split('.')[0],
      targetId: `target-${i}`,
      meta: { generated: true },
      timestamp: randomTime.toISOString()
    });
  }
  
  return baseEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};