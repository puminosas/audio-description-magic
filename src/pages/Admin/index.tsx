
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminTabs from '@/components/admin/AdminTabs';
import AdminAccessManager from '@/components/admin/AdminAccessManager';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Redirect if not admin
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <AdminAccessManager>
        <div className="container max-w-7xl mx-auto px-4 py-8 pt-20 md:pt-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your application and users</p>
            </div>
            
            <AdminTabs setMobileMenuOpen={setMobileMenuOpen} />
          </div>
        </div>
      </AdminAccessManager>
    </AdminLayout>
  );
};

export default Admin;
