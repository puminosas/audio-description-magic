
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminAiChat from '@/components/admin/AdminAiChat';

const AdminAiChatPage = () => {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>AI Chat Assistant</CardTitle>
          <CardDescription>
            Get help with administrative tasks and manage your platform more efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <p className="mb-4 text-muted-foreground">
            This AI assistant has knowledge of your platform and can help with common administrative tasks,
            provide guidance on troubleshooting issues, and assist with user management.
          </p>
          
          <AdminAiChat />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAiChatPage;
