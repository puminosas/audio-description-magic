import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import AdminActionsPanel from './ai-chat/AdminActionsPanel';
import ChatMessages from './ai-chat/ChatMessages';
import ProjectFilesPanel from './ai-chat/ProjectFilesPanel';
import FilePreviewPanel from './ai-chat/FilePreviewPanel';
import { MessageSquare, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminAiChat: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const { toast } = useToast();

  // Funkcija, kuri iškviečiama, kai pasirenkamas failas
  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath);
    setCurrentTab('files');
    
    // Pabandome nuskaityti failo turinį
    setIsLoadingContent(true);
    try {
      const response = await fetch(`/api/file-content?filePath=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFileContent(data.content);
    } catch (error) {
      console.error('Error loading file content:', error);
      toast({
        title: "Error",
        description: "Failed to load file content",
        variant: "destructive"
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Funkcija, kuri išsaugo failo pakeitimus
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    
    try {
      const response = await fetch('/api/edit-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath: selectedFile,
          newContent: fileContent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      toast({
        title: "Success",
        description: "File saved successfully"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: "Error",
        description: "Failed to save file changes",
        variant: "destructive"
      });
    }
  };

  // Funkcija, kuri analizuoja failą su AI
  const handleAnalyzeWithAI = async () => {
    if (!selectedFile) return;
    
    try {
      toast({
        title: "Analyzing...",
        description: "AI is analyzing the file content"
      });
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath: selectedFile
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Perjungiame į chat skirtuką, kad būtų rodomas AI atsakymas
      setCurrentTab('chat');
      
      // Šį rezultatą galite perduoti į ChatMessages komponentą, kad būtų rodomas kaip naujas pranešimas
      // Pavyzdžiui: addAIMessage(data.result);
      // Jei ChatMessages komponentas neturi tokios funkcijos, jums gali tekti atnaujinti tą komponentą
    } catch (error) {
      console.error('Error analyzing file with AI:', error);
      toast({
        title: "Error",
        description: "Failed to analyze file with AI",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-2xl font-bold">AI Assistant</h2>
        <p className="text-muted-foreground">
          Chat with AI and manage your project files
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <ProjectFilesPanel onFileSelect={handleFileSelect} selectedFile={selectedFile} />
        </div>
        
        <div className="md:col-span-3">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with AI
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center">
                <FileCode className="mr-2 h-4 w-4" />
                File Editor
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4 p-0">
              <ChatMessages />
            </TabsContent>
            
            <TabsContent value="files" className="mt-4 p-0">
              {selectedFile ? (
                <FilePreviewPanel
                  selectedFile={selectedFile}
                  fileContent={fileContent}
                  isLoadingContent={isLoadingContent}
                  setFileContent={setFileContent}
                  setIsEditing={setIsEditing}
                  handleSaveFile={handleSaveFile}
                  handleAnalyzeWithAI={handleAnalyzeWithAI}
                />
              ) : (
                <div className="text-center p-8 bg-muted rounded-md">
                  <p>Select a file from the project files panel to view and edit</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminAiChat;
