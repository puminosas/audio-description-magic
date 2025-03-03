
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
            Interact with OpenAI GPT-4o to manage your platform, analyze files, and automate admin tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <p className="mb-4 text-muted-foreground">
            This AI assistant has access to your Supabase database, project files, and administrative functions.
            Ask it to analyze user data, suggest code optimizations, or help with troubleshooting issues.
          </p>
          
          <AdminAiChat />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAiChatPage;
