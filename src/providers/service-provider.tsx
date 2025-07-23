// Service Provider Context - Enables adapter swapping (Mock -> Supabase -> Production)

import React, { createContext, useContext, ReactNode } from 'react';
import type { 
  CompanyService, 
  UserService, 
  ActivityService, 
  EmailService, 
  MetricsService 
} from '@/services/interfaces';
import { 
  MockCompanyService, 
  MockUserService, 
  MockActivityService, 
  MockEmailService, 
  MockMetricsService 
} from '@/services/mock';

interface ServiceContextValue {
  companyService: CompanyService;
  userService: UserService;
  activityService: ActivityService;
  emailService: EmailService;
  metricsService: MetricsService;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  // Later: add mode prop to select adapter (mock | supabase | production)
  mode?: 'mock' | 'supabase' | 'production';
}

export function ServiceProvider({ children, mode = 'mock' }: ServiceProviderProps) {
  // For now, always use mock services
  // Later: factory pattern to create services based on mode
  const services: ServiceContextValue = React.useMemo(() => {
    switch (mode) {
      case 'mock':
      default:
        return {
          companyService: new MockCompanyService(),
          userService: new MockUserService(),
          activityService: new MockActivityService(),
          emailService: new MockEmailService(),
          metricsService: new MockMetricsService()
        };
      // case 'supabase':
      //   return createSupabaseServices();
      // case 'production':
      //   return createProductionServices();
    }
  }, [mode]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): ServiceContextValue {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}

// Individual service hooks for convenience
export function useCompanyService(): CompanyService {
  return useServices().companyService;
}

export function useUserService(): UserService {
  return useServices().userService;
}

export function useActivityService(): ActivityService {
  return useServices().activityService;
}

export function useEmailService(): EmailService {
  return useServices().emailService;
}

export function useMetricsService(): MetricsService {
  return useServices().metricsService;
}