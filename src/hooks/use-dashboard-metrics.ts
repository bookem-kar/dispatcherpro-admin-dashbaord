// Dashboard Metrics Hook - Fetch live platform statistics

import { useQuery } from '@tanstack/react-query';
import { useMetricsService } from '@/providers/service-provider';

export interface DashboardMetrics {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  totalUsers: number;
  activeUsers: number;
  recentActivity: number;
}

export function useDashboardMetrics() {
  const metricsService = useMetricsService();

  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const [
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        totalUsers,
        activeUsers,
        recentActivity
      ] = await Promise.all([
        metricsService.getTotalCompanies(),
        metricsService.getActiveCompanies(),
        metricsService.getSuspendedCompanies(),
        metricsService.getTotalUsers(),
        metricsService.getActiveUsers(),
        metricsService.getRecentActivityCount(24)
      ]);

      return {
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        totalUsers,
        activeUsers,
        recentActivity
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}