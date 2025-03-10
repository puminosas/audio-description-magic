
import React from 'react';
import { Loader2 } from 'lucide-react';
import UserFilters from '@/components/admin/UserFilters';
import UsersTable from '@/components/admin/UsersTable';
import UserPagination from '@/components/admin/UserPagination';
import { useUserManagement } from '@/hooks/admin/useUserManagement';

const AdminUserManagement = () => {
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    filterPlan,
    setFilterPlan,
    page,
    setPage,
    totalCount,
    itemsPerPage,
    handleToggleAdmin,
    handleUpdatePlan,
    loadUsers
  } = useUserManagement();

  return (
    <div className="space-y-4">
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPlan={filterPlan}
        setFilterPlan={setFilterPlan}
        onRefresh={loadUsers}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <UsersTable
            users={users}
            onToggleAdmin={handleToggleAdmin}
            onUpdatePlan={handleUpdatePlan}
          />
          
          <UserPagination
            page={page}
            setPage={setPage}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default AdminUserManagement;
