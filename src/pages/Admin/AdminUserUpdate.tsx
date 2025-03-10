
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchUser from '@/components/admin/user-management/SearchUser';
import UpdateUserForm from '@/components/admin/user-management/UpdateUserForm';
import { useUserUpdate } from '@/hooks/admin/useUserUpdate';

const AdminUserUpdate = () => {
  const {
    userId,
    email,
    loading,
    searchLoading,
    selectedPlan,
    isAdmin,
    userFound,
    setUserId,
    setEmail,
    setSelectedPlan,
    setIsAdmin,
    searchUser,
    handleUpdateUser
  } = useUserUpdate();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <SearchUser 
          userId={userId}
          email={email}
          searchLoading={searchLoading}
          setUserId={setUserId}
          setEmail={setEmail}
          searchUser={searchUser}
        />
        
        {/* Update Form - only show if user is found */}
        {userFound && (
          <UpdateUserForm
            email={email}
            selectedPlan={selectedPlan}
            isAdmin={isAdmin}
            loading={loading}
            setSelectedPlan={setSelectedPlan}
            setIsAdmin={setIsAdmin}
            handleUpdateUser={handleUpdateUser}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserUpdate;
