
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Send, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ErrorAlert from '@/components/generator/ErrorAlert';
import ChatMessages from './ai-chat/ChatMessages';
import ProjectFilesPanel from './ai-chat/ProjectFilesPanel';
import FilePreviewPanel from './ai-chat/FilePreviewPanel';
import AdminActionsPanel from './ai-chat/AdminActionsPanel';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FileInfo {
  path: string;
  type: string;
  size?: number;
}

const AdminAiChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRefreshingFiles, setIsRefreshingFiles] = useState(false);
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Extract unique file types from the files array
  const uniqueFileTypes = Array.from(
    new Set(files.map(file => file.type))
  ).filter(type => type);

  // Fetch project files
  const fetchFiles = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingFiles(true);
    setError(null);
    setIsRefreshingFiles(true);
    
    try {
      console.log('Fetching project files...');
      const { data, error } = await supabase.functions.invoke('project-files', {
        method: 'GET',
      });

      if (error) {
        console.error('Error invoking project-files function:', error);
        throw new Error(error.message || 'Failed to load project files');
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response from project-files function:', data);
        throw new Error('Invalid response from server');
      }
      
      console.log('Project files loaded:', data.length);
      setFiles(data as FileInfo[]);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(`Failed to load project files: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load project files',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFiles(false);
      setIsRefreshingFiles(false);
    }
  }, [toast, user]);

  // On component mount, fetch files
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [fetchFiles, user]);

  // Send a message to the AI
  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Sending message to AI...');
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: updatedMessages,
          userId: user?.id
        },
      });

      if (error) {
        console.error('Error invoking ai-chat function:', error);
        throw new Error(error.message || 'Failed to get response from AI');
      }

      if (!data || !data.content) {
        console.error('Invalid response from ai-chat function:', data);
        throw new Error('Invalid response from AI');
      }

      console.log('AI response received');
      setMessages([...updatedMessages, data as Message]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to get response from AI: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle "Enter" key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get file content (simulated for now)
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    
    // In a real implementation, this would fetch the actual file content
    // For security reasons, we're just returning the file path information
    setFileContent(`// This is a preview for ${filePath}\n\n// In a full implementation, this would fetch and display the actual file content.\n// For security reasons, this feature is limited in the current version.`);
    
    setIsEditing(true);
  };

  // Simulate file editing
  const handleSaveFile = () => {
    toast({
      title: 'Feature Limited',
      description: `File editing is a simulated feature and doesn't modify actual files`,
    });
    setIsEditing(false);
    setSelectedFile(null);
    setFileContent('');
  };

  // Filter files by type and search term
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileTypeFilters.length === 0 || fileTypeFilters.includes(file.type);
    return matchesSearch && matchesType;
  });

  // Toggle a file type filter
  const toggleFileTypeFilter = (type: string) => {
    setFileTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Clear the chat
  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat Cleared',
      description: 'All chat messages have been cleared',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left side: Chat interface */}
      <div className="col-span-1 md:col-span-8">
        <Card className="flex h-[600px] flex-col overflow-hidden p-4">
          {/* Error message */}
          {error && (
            <div className="mb-4">
              <ErrorAlert error={error} />
            </div>
          )}
          
          {/* Messages container */}
          <ChatMessages 
            messages={messages} 
            isProcessing={isProcessing} 
            messagesEndRef={messagesEndRef} 
          />

          {/* Input area */}
          <div className="mt-4">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI assistant..."
                className="min-h-[80px] resize-none pr-12"
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2"
                onClick={sendMessage}
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for a new line
              </p>
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearChat}
                  className="h-7 px-2 text-xs"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Clear Chat
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Right side: Project files and user info */}
      <div className="col-span-1 md:col-span-4">
        <div className="space-y-6">
          {/* Project files */}
          <ProjectFilesPanel 
            files={files}
            filteredFiles={filteredFiles}
            uniqueFileTypes={uniqueFileTypes}
            fileTypeFilters={fileTypeFilters}
            isLoadingFiles={isLoadingFiles}
            isRefreshingFiles={isRefreshingFiles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            toggleFileTypeFilter={toggleFileTypeFilter}
            setFileTypeFilters={setFileTypeFilters}
            fetchFiles={fetchFiles}
            handleFileSelect={handleFileSelect}
          />

          {/* File editing */}
          {isEditing && selectedFile && (
            <FilePreviewPanel 
              selectedFile={selectedFile}
              fileContent={fileContent}
              setFileContent={setFileContent}
              setIsEditing={setIsEditing}
              handleSaveFile={handleSaveFile}
            />
          )}

          {/* Admin actions */}
          <AdminActionsPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminAiChat;
