import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/providers/service-provider';
import { PlatformUser, CreateUserInput, UserFilter } from '@/types/domain';

export function useUsers(filter?: UserFilter) {
  const { userService } = useServices();
  
  return useQuery({
    queryKey: ['users', filter],
    queryFn: () => userService.listUsers(filter),
    staleTime: 30000, // Keep data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });
}

export function useUser(id: string) {
  const { userService } = useServices();
  
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const { userService } = useServices();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateUserInput) => userService.createUser(input),
    onSuccess: () => {
      // Only invalidate companies since we're not managing users locally in Supabase mode
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useSuspendUser() {
  const { userService } = useServices();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      userService.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useReinstateUser() {
  const { userService } = useServices();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userService.reinstateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const { userService } = useServices();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}