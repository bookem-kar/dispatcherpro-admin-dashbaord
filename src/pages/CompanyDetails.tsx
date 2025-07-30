import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Shield, ShieldCheck } from 'lucide-react';
import { useCompany, useSuspendCompany, useReinstateCompany } from '@/hooks/use-companies';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EditCompanyModal } from '@/components/companies/EditCompanyModal';
import { useToast } from '@/hooks/use-toast';
import type { CompanyStatus } from '@/types/domain';

const statusColors: Record<CompanyStatus, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-500/20',
  suspended: 'bg-red-500/10 text-red-700 border-red-500/20',
  inactive: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

export function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: company, isLoading, error } = useCompany(id!);
  const suspendCompany = useSuspendCompany();
  const reinstateCompany = useReinstateCompany();

  const handleSuspend = async () => {
    if (!company) return;
    
    try {
      await suspendCompany.mutateAsync({
        id: company.id,
        reason: 'Manual suspension from admin panel'
      });
      toast({
        title: "Company Suspended",
        description: `${company.name} has been suspended successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend company. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReinstate = async () => {
    if (!company) return;
    
    try {
      await reinstateCompany.mutateAsync(company.id);
      
      // Sync with Bubble.io after successful reinstatement
      if (company.bubbleCompanyId) {
        try {
          await supabase.functions.invoke('sync-company-status', {
            body: {
              companyUid: company.companyUid,
              bubbleCompanyId: company.bubbleCompanyId,
              status: 'active'
            }
          });
          console.log('Company status synced with Bubble.io');
        } catch (syncError) {
          console.warn('Failed to sync with Bubble.io:', syncError);
          // Don't fail the whole operation if sync fails
        }
      }
      
      toast({
        title: "Company Reinstated",
        description: `${company.name} has been reinstated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to reinstate company. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">Company not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground">Company Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Company
          </Button>
          
          {company.status === 'suspended' ? (
            <Button
              variant="outline"
              onClick={handleReinstate}
              disabled={reinstateCompany.isPending}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Reinstate
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleSuspend}
              disabled={suspendCompany.isPending}
            >
              <Shield className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={statusColors[company.status]}>
                  {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plan Tier</label>
              <p className="mt-1 capitalize">{company.planTier}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company UID</label>
              <p className="mt-1 font-mono text-sm">{company.companyUid}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">MC Number</label>
              <p className="mt-1">{company.mcNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1">{company.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <p className="mt-1">{company.phoneNumber}</p>
            </div>
            
            {company.phoneTollFree && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Toll Free</label>
                <p className="mt-1">{company.phoneTollFree}</p>
              </div>
            )}
            
            {company.faxNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fax Number</label>
                <p className="mt-1">{company.faxNumber}</p>
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="mt-1">{company.address}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Website</label>
              <p className="mt-1">{company.website}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Details */}
      <Card>
        <CardHeader>
          <CardTitle>Admin User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Admin Name</label>
              <p className="mt-1">{company.adminFirstName} {company.adminLastName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Admin Email</label>
              <p className="mt-1">{company.adminEmail}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Admin Phone</label>
              <p className="mt-1">{company.adminPhone}</p>
            </div>
            
            {company.adminUserId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Admin User ID</label>
                <p className="mt-1 font-mono text-sm">{company.adminUserId}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.bubbleCompanyId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bubble Company ID</label>
                <p className="mt-1 font-mono text-sm">{company.bubbleCompanyId}</p>
              </div>
            )}
            
            {company.superDispatchAcct && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">SuperDispatch Account</label>
                <p className="mt-1">{company.superDispatchAcct}</p>
              </div>
            )}
            
            {company.centralDispatchAcct && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">CentralDispatch Account</label>
                <p className="mt-1">{company.centralDispatchAcct}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage & Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Active Users</label>
              <p className="mt-1 text-2xl font-semibold">{company.activeUserCount || 0}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Max Seats</label>
              <p className="mt-1 text-2xl font-semibold">{company.maxSeats || 'Unlimited'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="mt-1">{new Date(company.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
              <p className="mt-1">
                {company.lastActivityAt 
                  ? new Date(company.lastActivityAt).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
          
          {company.status === 'suspended' && company.suspendedAt && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Suspended At</label>
                  <p className="mt-1">{new Date(company.suspendedAt).toLocaleDateString()}</p>
                </div>
                
                {company.suspendedReason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Suspension Reason</label>
                    <p className="mt-1">{company.suspendedReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditCompanyModal 
        company={company}
        open={showEditModal} 
        onOpenChange={setShowEditModal} 
      />
    </div>
  );
}