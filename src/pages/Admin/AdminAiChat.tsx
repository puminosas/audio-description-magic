import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminAiChat from '@/components/admin/AdminAiChat';

const AdminAiChatPage: React.FC = () => {
  return (
    <AdminLayout>
      <AdminAiChat />
    </AdminLayout>
  );
};

export default AdminAiChatPage;
