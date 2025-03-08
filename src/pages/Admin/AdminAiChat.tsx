
import React from 'react';
import AdminAiChat from '@/components/admin/AdminAiChat';

const AdminAiChatPage: React.FC = () => {
  return (
    <div className="h-full w-full">
      <h1 className="text-2xl font-bold mb-4">AI Chat Console</h1>
      <div className="bg-card rounded-lg shadow-md h-[calc(100%-4rem)]">
        <AdminAiChat />
      </div>
    </div>
  );
};

export default AdminAiChatPage;
