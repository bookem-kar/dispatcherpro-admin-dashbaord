import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Company, CompanyStatus } from '@/types/domain';
import { useCompanies, useSuspendCompany, useReinstateCompany } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
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
  const navigate = useNavigate();
  const {
    data: companies = [],
    isLoading
  } = useCompanies();
  const suspendCompany = useSuspendCompany();
  const reinstateCompany = useReinstateCompany();
  const {
    toast
  } = useToast();
  const filteredCompanies = companies.filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()) || company.companyUid.toLowerCase().includes(searchTerm.toLowerCase()));
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
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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
              </TableRow> : filteredCompanies.length === 0 ? <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No companies found matching your search.' : 'No companies yet.'}
                </TableCell>
              </TableRow> : filteredCompanies.map(company => <TableRow key={company.id}>
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
                        {company.status === 'suspended' ? <DropdownMenuItem onClick={() => handleReinstate(company)}>
                            Reinstate Company
                          </DropdownMenuItem> : <DropdownMenuItem onClick={() => handleSuspend(company)}>
                            Suspend Company
                          </DropdownMenuItem>}
                        <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>;
}