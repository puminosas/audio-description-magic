
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminAiChat from '@/components/admin/AdminAiChat';

const AdminAiChatPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="h-full w-full p-4 flex flex-col">
        <AdminAiChat />
      </div>
    </AdminLayout>
  );
};

export default AdminAiChatPage;
