import React, { useState } from 'react';
import { UsersTable } from '@/components/users/UsersTable';
import { CreateUserModal } from '@/components/users/CreateUserModal';

export function Users() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage platform users and their permissions.</p>
      </div>
      
      <UsersTable onCreateUser={() => setShowCreateModal(true)} />
      
      <CreateUserModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}