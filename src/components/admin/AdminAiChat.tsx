
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useCombinedChatLogic from './ai-chat/hooks/useCombinedChatLogic';
import ChatInterface from './ai-chat/components/ChatInterface';
import FileFiltersComponent from './ai-chat/components/FileFiltersComponent';
import FileList from './ai-chat/components/FileList';
import type { FileInfo } from './ai-chat/types';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminAiChat: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    handleSendMessage,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeFile,
    files,
    selectedFile,
    filters,
    setSearchQuery,
    toggleTypeFilter,
    resetFilters,
  } = useCombinedChatLogic();

  const isMobile = useIsMobile();
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
        {isMobile && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSidebar}
            className="md:hidden"
          >
            {sidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {sidebarVisible ? 'Hide Files' : 'Show Files'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* File sidebar - conditionally visible on mobile */}
        {(sidebarVisible || !isMobile) && (
          <Card className={`p-4 ${isMobile ? 'fixed inset-0 z-50 w-full h-full overflow-auto bg-background' : 'md:col-span-1 overflow-hidden flex flex-col'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">File Management</h3>
              {isMobile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Chat
                </Button>
              )}
            </div>
            
            <div className="mb-4">
              <FileFiltersComponent
                filters={filters}
                setSearchQuery={setSearchQuery}
                toggleTypeFilter={toggleTypeFilter}
                resetFilters={resetFilters}
              />
            </div>
            <div className={`${isMobile ? 'overflow-auto pb-20' : 'flex-grow overflow-auto'}`}>
              <FileList
                files={files}
                selectedFile={selectedFile}
                onFileSelect={(file) => {
                  handleFileSelect(file);
                  if (isMobile) setSidebarVisible(false);
                }}
              />
            </div>
          </Card>
        )}

        {/* Chat interface */}
        <Card className={`p-4 ${isMobile && sidebarVisible ? 'hidden' : ''} md:col-span-3 h-full flex flex-col overflow-hidden bg-background`}>
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            selectedFile={selectedFile as FileInfo}
            onSaveFile={handleSaveFile}
            onAnalyzeFile={handleAnalyzeFile}
            error={error}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminAiChat;
