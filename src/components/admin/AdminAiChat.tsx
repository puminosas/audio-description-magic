
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ChatMessages from './ai-chat/ChatMessages';
import ProjectFilesPanel from './ai-chat/ProjectFilesPanel';
import FilePreviewPanel from './ai-chat/FilePreviewPanel';
import AdminActionsPanel from './ai-chat/AdminActionsPanel';
import EmptyChat from './ai-chat/EmptyChat';
import ErrorMessage from './ai-chat/ErrorMessage';
import ChatInput from './ai-chat/ChatInput';
import ChatSessionsList from './ai-chat/ChatSessionsList';
import { useToast } from '@/hooks/use-toast';

const AdminAiChat: React.FC = () => {
  const { toast } = useToast();

  // File state
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch project files
  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    setFileError(null);
    
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFileError('Failed to load project files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Fetch file content
  const fetchFileContent = async (filePath: string) => {
    setIsLoadingContent(true);
    setFileError(null);
    
    try {
      const response = await fetch(`/api/file-content?filePath=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFileContent(data.content);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileError(`Failed to load content for ${filePath}`);
      setFileContent(`// Error loading content for ${filePath}\n// ${error}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Save file content
  const saveFileContent = async () => {
    if (!selectedFile) return;
    
    try {
      const response = await fetch('/api/edit-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath: selectedFile, newContent: fileContent })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      toast({
        title: 'Success',
        description: 'File saved successfully'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: 'Error',
        description: 'Failed to save file changes',
        variant: 'destructive'
      });
    }
  };

  // Send message to AI
  const sendMessage = async (message: string) => {
    if (!message.trim() || isTyping) return;
    
    const userMessage = { 
      role: 'user', 
      content: message, 
      id: crypto.randomUUID(), 
      createdAt: new Date().toISOString() 
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);
    setChatError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.content,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatError(`Error: ${error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  // Analyze file with AI
  const analyzeWithAI = () => {
    if (!selectedFile || !fileContent) return;
    
    // Get file extension
    const fileExtension = selectedFile.split('.').pop()?.toLowerCase() || '';
    let fileType = 'text file';
    
    if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
    if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
    if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
    if (['html'].includes(fileExtension)) fileType = 'HTML file';
    if (['json'].includes(fileExtension)) fileType = 'JSON file';
    
    // Create analysis message
    const analysisPrompt = `Please analyze this ${fileType} located at \`${selectedFile}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\``;
    
    // Send the message
    sendMessage(analysisPrompt);
  };

  // Retry last message
  const retryLastMessage = () => {
    if (messages.length > 0) {
      const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
        // Remove messages after the last user message
        setMessages(messages.slice(0, messages.length - lastUserMessageIndex));
        // Resend the last user message
        sendMessage(lastUserMessage.content);
      }
    }
  };

  // Handle when user selects a file
  const handleFileSelect = async (filePath: string) => {
    // Save current file content if it's being edited
    if (selectedFile && isEditing) {
      await saveFileContent();
    }
    
    setSelectedFile(filePath);
    await fetchFileContent(filePath);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Admin Assistant</h1>
      
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="files">Project Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sessions panel */}
            <div className="md:col-span-1">
              <ChatSessionsList 
                sessions={sessions}
                currentSessionId={currentSessionId}
                isLoading={isLoadingSessions}
                onCreateNewSession={() => {
                  setMessages([]);
                  setCurrentSessionId(null);
                }}
                onLoadSession={(sessionId) => {
                  setCurrentSessionId(sessionId);
                  // Load session messages implementation
                }}
                onDeleteSession={(sessionId) => {
                  // Delete session implementation
                }}
                onRenameSession={(sessionId, newTitle) => {
                  // Rename session implementation
                }}
              />
              
              <div className="mt-4">
                <AdminActionsPanel />
              </div>
            </div>
            
            {/* Chat area */}
            <div className="md:col-span-3 flex flex-col h-[calc(100vh-250px)]">
              <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <EmptyChat />
                    ) : (
                      <ChatMessages 
                        messages={messages} 
                        isTyping={isTyping} 
                        messagesEndRef={messagesEndRef} 
                      />
                    )}
                    
                    {chatError && <ErrorMessage error={chatError} retryLastMessage={retryLastMessage} />}
                  </div>
                  
                  <div className="p-4 border-t">
                    <ChatInput 
                      onSendMessage={sendMessage}
                      isLoading={isTyping}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* File browser */}
            <div className="md:col-span-1">
              <ProjectFilesPanel 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
              />
            </div>
            
            {/* File preview */}
            <div className="md:col-span-3">
              {selectedFile ? (
                <FilePreviewPanel 
                  selectedFile={selectedFile}
                  fileContent={fileContent}
                  isLoadingContent={isLoadingContent}
                  setFileContent={setFileContent}
                  setIsEditing={setIsEditing}
                  handleSaveFile={saveFileContent}
                  handleAnalyzeWithAI={analyzeWithAI}
                />
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Select a file to preview and edit</p>
                </Card>
              )}
              
              {fileError && (
                <ErrorMessage 
                  error={fileError} 
                  retryLastMessage={retryLastMessage}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAiChat;
