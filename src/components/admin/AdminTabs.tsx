
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAnalytics from '@/pages/Admin/AdminAnalytics';
import AdminAudioFiles from '@/pages/Admin/AdminAudioFiles';
import AdminUserManagement from '@/pages/Admin/AdminUserManagement';
import AdminUserActivity from '@/pages/Admin/AdminUserActivity';
import AdminFeedback from '@/pages/Admin/AdminFeedback';
import AdminSettings from '@/pages/Admin/AdminSettings';
import AdminAiChatPage from '@/pages/Admin/AdminAiChat';

interface AdminTabsProps {
  setMobileMenuOpen: (open: boolean) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current tab from path
  const getCurrentTab = () => {
    const path = location.pathname.split('/')[2] || '';
    switch (path) {
      case 'audio-files': return 'audio-files';
      case 'users': return 'users';
      case 'user-update': return 'users';
      case 'user-activity': return 'user-activity';
      case 'feedback': return 'feedback';
      case 'ai-chat': return 'ai-chat';
      case 'settings': return 'settings';
      default: return 'analytics';
    }
  };

  const handleTabClick = (tab: string) => {
    setMobileMenuOpen(false);
    
    switch (tab) {
      case 'audio-files': navigate('/admin/audio-files'); break;
      case 'users': navigate('/admin/users'); break;
      case 'user-update': navigate('/admin/user-update'); break;
      case 'user-activity': navigate('/admin/user-activity'); break;
      case 'feedback': navigate('/admin/feedback'); break;
      case 'ai-chat': navigate('/admin/ai-chat'); break;
      case 'settings': navigate('/admin/settings'); break;
      default: navigate('/admin'); break;
    }
  };
  
  return (
    <Tabs value={getCurrentTab()} className="space-y-6">
      <div className="overflow-auto">
        <TabsList className="flex flex-wrap">
          <TabsTrigger 
            value="analytics" 
            onClick={() => handleTabClick('analytics')} 
            className="flex-shrink-0"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="audio-files" 
            onClick={() => handleTabClick('audio-files')} 
            className="flex-shrink-0"
          >
            Audio Files
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            onClick={() => handleTabClick('users')} 
            className="flex-shrink-0"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="user-activity" 
            onClick={() => handleTabClick('user-activity')} 
            className="flex-shrink-0"
          >
            User Activity
          </TabsTrigger>
          <TabsTrigger 
            value="feedback" 
            onClick={() => handleTabClick('feedback')} 
            className="flex-shrink-0"
          >
            Feedback
          </TabsTrigger>
          <TabsTrigger 
            value="ai-chat" 
            onClick={() => handleTabClick('ai-chat')} 
            className="flex-shrink-0"
          >
            AI Chat
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            onClick={() => handleTabClick('settings')} 
            className="flex-shrink-0"
          >
            Settings
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="analytics">
        <AdminAnalytics />
      </TabsContent>
      <TabsContent value="audio-files">
        <AdminAudioFiles />
      </TabsContent>
      <TabsContent value="users">
        <AdminUserManagement />
      </TabsContent>
      <TabsContent value="user-activity">
        <AdminUserActivity />
      </TabsContent>
      <TabsContent value="feedback">
        <AdminFeedback />
      </TabsContent>
      <TabsContent value="ai-chat">
        <AdminAiChatPage />
      </TabsContent>
      <TabsContent value="settings">
        <AdminSettings />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
