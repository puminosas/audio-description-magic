
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, Send, Code, FileText, User, Info, 
  AlertCircle, Search, RefreshCw, RotateCcw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ErrorAlert from '@/components/generator/ErrorAlert';
import { Input } from '@/components/ui/input';

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
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Info className="mb-2 h-12 w-12 opacity-50" />
                <h3 className="mb-1 text-lg font-medium">AI Assistant</h3>
                <p className="max-w-md text-sm">
                  Ask me anything about your project, users, or administrative tasks.
                  I can help with troubleshooting, data analysis, and task automation.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
                  <Loader2 className="h-5 w-5 animate-spin" />
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
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center text-lg font-medium">
                <FileText className="mr-2 h-5 w-5" />
                Project Files
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchFiles}
                disabled={isRefreshingFiles}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingFiles ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh Files</span>
              </Button>
            </div>
            
            {/* Search input */}
            <div className="mb-3 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* File type filters */}
            {uniqueFileTypes.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {uniqueFileTypes.map(type => (
                  <Button
                    key={type}
                    variant={fileTypeFilters.includes(type) ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => toggleFileTypeFilter(type)}
                  >
                    {type}
                  </Button>
                ))}
                {fileTypeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setFileTypeFilters([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
            
            <div className="max-h-[250px] overflow-y-auto rounded-md border">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading files...</span>
                </div>
              ) : filteredFiles.length > 0 ? (
                <ul className="divide-y">
                  {filteredFiles.map((file, index) => (
                    <li key={index} className="px-1 py-0.5 hover:bg-muted/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start p-1 text-left text-xs"
                        onClick={() => handleFileSelect(file.path)}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        <span className="truncate">{file.path}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center py-8 text-center text-sm text-muted-foreground">
                  {files.length === 0 ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No files available
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      No matching files found
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {filteredFiles.length} of {files.length} files shown
            </p>
          </Card>

          {/* File editing */}
          {isEditing && selectedFile && (
            <Card className="p-4">
              <h3 className="mb-3 flex items-center text-lg font-medium">
                <Code className="mr-2 h-5 w-5" />
                File Preview: {selectedFile}
              </h3>
              <Textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
                readOnly
              />
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Close
                </Button>
                <Button onClick={handleSaveFile} disabled>File Editing Disabled</Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Note: For security reasons, file editing is disabled in this version
              </p>
            </Card>
          )}

          {/* Admin actions */}
          <Card className="p-4">
            <h3 className="mb-3 flex items-center text-lg font-medium">
              <User className="mr-2 h-5 w-5" />
              Admin Actions
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <span className="truncate">View System Status</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <span className="truncate">Manage User Permissions</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <span className="truncate">Update App Settings</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <span className="truncate">View Activity Logs</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAiChat;
