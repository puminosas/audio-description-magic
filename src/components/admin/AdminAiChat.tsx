
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Code, FileText, User, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FileInfo {
  path: string;
  type: string;
}

const AdminAiChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch project files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('project-files', {
          method: 'GET',
        });

        if (error) throw error;
        setFiles(data as FileInfo[]);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project files',
          variant: 'destructive',
        });
      }
    };

    fetchFiles();
  }, [toast]);

  // Send a message to the AI
  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: updatedMessages,
          userId: user?.id
        },
      });

      if (error) throw error;

      setMessages([...updatedMessages, data as Message]);
    } catch (error) {
      console.error('Error sending message:', error);
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

  // Simulate file selection
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    // In a real implementation, this would fetch the actual file content
    setFileContent(`// This is a simulated file content for ${filePath}\n\n// In a real implementation, this would be the actual file content.`);
    setIsEditing(true);
  };

  // Simulate file editing
  const handleSaveFile = () => {
    toast({
      title: 'Success',
      description: `File ${selectedFile} updated successfully (simulated)`,
    });
    setIsEditing(false);
    setSelectedFile(null);
    setFileContent('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left side: Chat interface */}
      <div className="col-span-1 md:col-span-8">
        <Card className="flex h-[600px] flex-col overflow-hidden p-4">
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
            <p className="mt-2 text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for a new line
            </p>
          </div>
        </Card>
      </div>

      {/* Right side: Project files and user info */}
      <div className="col-span-1 md:col-span-4">
        <div className="space-y-6">
          {/* Project files */}
          <Card className="p-4">
            <h3 className="mb-3 flex items-center text-lg font-medium">
              <FileText className="mr-2 h-5 w-5" />
              Project Files
            </h3>
            <div className="max-h-[200px] overflow-y-auto">
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => handleFileSelect(file.path)}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      <span className="truncate">{file.path}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* File editing */}
          {isEditing && selectedFile && (
            <Card className="p-4">
              <h3 className="mb-3 flex items-center text-lg font-medium">
                <Code className="mr-2 h-5 w-5" />
                Edit File: {selectedFile}
              </h3>
              <Textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFile}>Save Changes</Button>
              </div>
            </Card>
          )}

          {/* User information */}
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
