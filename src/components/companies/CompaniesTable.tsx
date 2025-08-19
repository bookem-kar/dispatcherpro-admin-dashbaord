import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Company, CompanyStatus } from '@/types/domain';
import { useCompanies, useSuspendCompany, useReinstateCompany, useResetCompanyPassword } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
const statusColors: Record<CompanyStatus, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800'
};
interface CompaniesTableProps {
  onCreateCompany: () => void;
}
export function CompaniesTable({
  onCreateCompany
}: CompaniesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  
  const {
    data: companiesData,
    isLoading
  } = useCompanies({
    search: searchTerm || undefined,
    page: currentPage,
    limit: pageSize
  });

  const companies = companiesData?.companies || [];
  const totalCompanies = companiesData?.total || 0;
  const totalPages = Math.ceil(totalCompanies / pageSize);
  const suspendCompany = useSuspendCompany();
  const reinstateCompany = useReinstateCompany();
  const resetCompanyPassword = useResetCompanyPassword();
  const {
    toast
  } = useToast();

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const handleSuspend = async (company: Company) => {
    try {
      await suspendCompany.mutateAsync({
        id: company.id,
        reason: 'Administrative suspension'
      });
      toast({
        title: 'Company suspended',
        description: `${company.name} has been suspended.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend company.',
        variant: 'destructive'
      });
    }
  };
  const handleReinstate = async (company: Company) => {
    try {
      await reinstateCompany.mutateAsync(company.id);
      toast({
        title: 'Company reinstated',
        description: `${company.name} has been reinstated.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reinstate company.',
        variant: 'destructive'
      });
    }
  };

  const handleResetPassword = async (company: Company) => {
    try {
      await resetCompanyPassword.mutateAsync(company.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink 
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    return items;
  };
  return <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Companies</CardTitle>
          <Button onClick={onCreateCompany}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search companies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading companies...
                </TableCell>
              </TableRow> : companies.length === 0 ? <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No companies found matching your search.' : 'No companies yet.'}
                </TableCell>
              </TableRow> : companies.map(company => <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.companyUid}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[company.status]}>
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{company.planTier}</TableCell>
                  <TableCell>
                    {company.activeUserCount || 0}
                    {company.maxSeats && ` / ${company.maxSeats}`}
                  </TableCell>
                  <TableCell>{formatDate(company.lastActivityAt)}</TableCell>
                  <TableCell>{formatDate(company.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}`)}>
                          
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Users</DropdownMenuItem>
                        {company.status === 'inactive' && (
                          <DropdownMenuItem onClick={() => handleResetPassword(company)}>
                            Resend Password Reset Email
                          </DropdownMenuItem>
                        )}
                        {company.status === 'suspended' ? <DropdownMenuItem onClick={() => handleReinstate(company)}>
                            Reinstate Company
                          </DropdownMenuItem> : <DropdownMenuItem onClick={() => handleSuspend(company)}>
                            Suspend Company
                          </DropdownMenuItem>}
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCompanies)} of {totalCompanies} companies
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>;
}