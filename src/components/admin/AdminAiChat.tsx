import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileState } from '@/components/admin/ai-chat/hooks/file-management/useFileState';
import { useFileFilters } from '@/components/admin/ai-chat/hooks/file-management/useFileFilters';
import { useFileOperations } from '@/components/admin/ai-chat/hooks/file-management/useFileOperations';
import { FileInfo, FileFilters } from '@/components/admin/ai-chat/types';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useCombinedChatLogic } from './ai-chat/hooks/useCombinedChatLogic';

interface ChatMessage {
  id: string;
  text: string;
  isUserMessage: boolean;
  timestamp: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedFile: FileInfo | null;
  onSaveFile: (file: FileInfo, content: string) => Promise<boolean>;
  onAnalyzeFile: (file: FileInfo) => Promise<void>;
  error: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  selectedFile,
  onSaveFile,
  onAnalyzeFile,
  error,
}) => {
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessageClick = () => {
    if (input.trim() !== '') {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageClick();
    }
  };

  const handleSaveClick = () => {
    if (selectedFile) {
      setIsSaveDialogOpen(true);
      setFileContent(selectedFile.content || '');
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a file to save.",
      });
    }
  };

  const handleSaveConfirm = async () => {
    if (selectedFile) {
      const success = await onSaveFile(selectedFile, fileContent);
      if (success) {
        toast({
          title: "File Saved",
          description: "The file has been successfully saved.",
        });
      } else {
        toast({
          title: "Save Failed",
          description: "There was an error saving the file.",
          variant: "destructive",
        });
      }
      setIsSaveDialogOpen(false);
    }
  };

  const handleAnalyzeClick = async () => {
    if (selectedFile) {
      setIsAnalyzing(true);
      try {
        await onAnalyzeFile(selectedFile);
        toast({
          title: "Analysis Complete",
          description: "The file has been analyzed.",
        });
      } catch (err) {
        console.error("Error during file analysis:", err);
        toast({
          title: "Analysis Failed",
          description: "There was an error analyzing the file.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a file to analyze.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="flex flex-col space-y-4 p-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}>
              {/* Conditionally render Avatar only for AI messages */}
              {!message.isUserMessage && (
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarImage src="https://github.com/shadcn.png" alt="AI Avatar" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 text-sm w-fit max-w-[80%] ${message.isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                <div className="text-xs text-muted-foreground mt-1">{message.timestamp}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start justify-start">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarImage src="https://github.com/shadcn.png" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 text-sm w-fit max-w-[80%] bg-secondary animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm">Error: {error}</div>
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleSaveClick} disabled={!selectedFile}>
            Save File
          </Button>
          <Button size="sm" variant="outline" onClick={handleAnalyzeClick} disabled={!selectedFile || isAnalyzing} >
            {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnterPress}
            placeholder="Type your message..."
            className="flex-grow resize-none"
          />
          <Button onClick={handleSendMessageClick} disabled={isLoading}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      {/* Save File Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit File Content</DialogTitle>
            <DialogDescription>
              Make changes to the file content before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="content"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface FileFiltersProps {
  filters: FileFilters;
  setSearchQuery: (query: string) => void;
  toggleTypeFilter: (type: string) => void;
  resetFilters: () => void;
}

const FileFiltersComponent: React.FC<FileFiltersProps> = ({
  filters,
  setSearchQuery,
  toggleTypeFilter,
  resetFilters,
}) => {
  return (
    <div className="bg-secondary rounded-md p-4 mb-4">
      <h4 className="mb-2 font-semibold">Filter Files</h4>
      <Input
        type="search"
        placeholder="Search files..."
        value={filters.searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3"
      />
      <div className="flex items-center space-x-3 mb-3">
        <Label htmlFor="type-text" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Text
        </Label>
        <Checkbox
          id="type-text"
          checked={filters.type.includes('text')}
          onCheckedChange={() => toggleTypeFilter('text')}
        />

        <Label htmlFor="type-code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Code
        </Label>
        <Checkbox
          id="type-code"
          checked={filters.type.includes('code')}
          onCheckedChange={() => toggleTypeFilter('code')}
        />
      </div>
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
};

interface FileListProps {
  files: FileInfo[];
  selectedFile: FileInfo | null;
  onFileSelect: (file: FileInfo) => void;
}

const FileList: React.FC<FileListProps> = ({ files, selectedFile, onFileSelect }) => {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <Card
          key={file.path}
          className={`cursor-pointer ${selectedFile?.path === file.path ? 'border-2 border-primary' : 'border'}`}
          onClick={() => onFileSelect(file)}
        >
          <CardContent className="flex items-center justify-between p-3">
            <div className="text-sm font-medium">{file.name}</div>
            <Badge variant="secondary">{file.type}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface AdminAiChatProps {
  // Define any props here
}

const AdminAiChat: React.FC<AdminAiChatProps> = () => {
  const {
    messages,
    input,
    isLoading,
    error,
    handleSendMessage,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeFile,
    files,
    selectedFile,
    setFiles,
    setSelectedFile,
    setIsLoadingFiles,
    setIsLoadingFile,
    setFileError,
  } = useCombinedChatLogic();

  const { filters, filteredFiles, setSearchQuery, toggleTypeFilter, resetFilters } = useFileFilters(files);

  return (
    <div className="container mx-auto h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI Chat Interface</h1>

      <div className="flex flex-grow">
        {/* File Management Section */}
        <div className="w-1/4 p-4 border-r">
          <h3 className="text-lg font-semibold mb-2">File Management</h3>
          <FileFiltersComponent
            filters={filters}
            setSearchQuery={setSearchQuery}
            toggleTypeFilter={toggleTypeFilter}
            resetFilters={resetFilters}
          />
          <FileList
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Chat Interface Section */}
        <div className="flex-grow flex flex-col">
          
          <ChatInterface 
            messages={messages}
            isLoading={isLoading} // Ensure this is a boolean, not a string
            onSendMessage={handleSendMessage}
            selectedFile={selectedFile as FileInfo} // Type cast to FileInfo
            onSaveFile={handleSaveFile as (file: FileInfo, content: string) => Promise<boolean>} // Type cast with correct signature
            onAnalyzeFile={handleAnalyzeFile as (file: FileInfo) => Promise<void>} // Type cast with correct signature
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAiChat;
