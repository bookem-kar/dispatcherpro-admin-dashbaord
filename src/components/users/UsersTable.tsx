import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useUsers, useDeleteUser, useSuspendUser, useReinstateUser } from '@/hooks/use-users';
import { useCompanies } from '@/hooks/use-companies';
import { useAuth } from '@/hooks/use-auth';
import { Search, MoreHorizontal, Plus, UserX, UserCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsersTableProps {
  onCreateUser: () => void;
}

export function UsersTable({ onCreateUser }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  
  const { data: usersData, isLoading, error } = useUsers({
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    limit: usersPerPage,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  
  const { data: companiesData } = useCompanies();
  const companies = companiesData?.companies || [];
  const { user: currentUser } = useAuth();
  const deleteUser = useDeleteUser();
  const suspendUser = useSuspendUser();
  const reinstateUser = useReinstateUser();
  const { toast } = useToast();

  const getUserCompany = (companyId: string) => {
    return companies.find(c => c.id === companyId);
  };

  const getStatusText = (user: any) => {
    if (user.isSuspended) return 'suspended';
    if (!user.isActive) return 'pending';
    return 'active';
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Reset to first page when search term changes (not just on input change)
    if (value !== searchTerm) {
      setCurrentPage(1);
    }
  };

  const handleSuspend = async (userId: string, userName: string) => {
    try {
      await suspendUser.mutateAsync({ id: userId });
      toast({
        title: 'User suspended',
        description: `${userName} has been suspended successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReinstate = async (userId: string, userName: string) => {
    try {
      await reinstateUser.mutateAsync(userId);
      toast({
        title: 'User reinstated',
        description: `${userName} has been reinstated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reinstate user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Authentication required to delete user.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteUser.mutateAsync({ userId, deletedByUserId: currentUser.id });
      toast({
        title: 'User deleted',
        description: `${userName} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case 'user':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">User</Badge>;
      case 'manager':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Manager</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading users. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateUser} className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {debouncedSearchTerm ? 'No users found matching your search.' : 'No users found.'}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const company = getUserCompany(user.companyId);
                const status = getStatusText(user);
                return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{company?.name || 'Unknown'}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                          Copy email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleSuspend(user.id, `${user.firstName} ${user.lastName}`)}
                            className="text-orange-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend user
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleReinstate(user.id, `${user.firstName} ${user.lastName}`)}
                            className="text-green-600"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Reinstate user
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(pageNumber)}
                    isActive={currentPage === pageNumber}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}