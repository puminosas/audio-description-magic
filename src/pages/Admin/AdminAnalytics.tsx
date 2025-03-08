
import React from 'react';
import AnalyticsContainer from '@/components/admin/analytics/AnalyticsContainer';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <AnalyticsContainer />
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
