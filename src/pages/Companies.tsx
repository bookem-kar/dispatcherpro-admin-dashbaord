import React, { useState } from 'react';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { CreateCompanyModal } from '@/components/companies/CreateCompanyModal';

export function Companies() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Companies</h1>
        <p className="text-muted-foreground">Manage platform companies and their access.</p>
      </div>
      
      <CompaniesTable onCreateCompany={() => setShowCreateModal(true)} />
      
      <CreateCompanyModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}