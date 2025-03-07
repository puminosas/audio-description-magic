
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminAiChat from '@/components/admin/AdminAiChat';

const AdminAiChatPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6 h-full w-full">
        <AdminAiChat />
      </div>
    </AdminLayout>
  );
};

export default AdminAiChatPage;
