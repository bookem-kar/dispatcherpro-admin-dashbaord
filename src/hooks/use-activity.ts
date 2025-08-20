// Activity Hook - Fetch activity events

import { useQuery } from '@tanstack/react-query';
import { useActivityService } from '@/providers/service-provider';
import type { ActivityEvent, ActivityFilter } from '@/types/domain';

export function useActivity(filter?: ActivityFilter) {
  const activityService = useActivityService();

  return useQuery({
    queryKey: ['activity', filter],
    queryFn: () => activityService.listActivity(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRecentActivity(limit: number = 10) {
  return useActivity({ 
    limit
  });
}