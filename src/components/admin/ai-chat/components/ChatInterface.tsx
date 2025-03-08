
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FileInfo } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import FileActionButtons from './FileActionButtons';
import FileEditDialog from './FileEditDialog';

export interface ChatMessage {
  id: string;
  text: string;
  isUserMessage: boolean;
  timestamp: string;
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedFile: FileInfo | null;
  onSaveFile: (file: FileInfo, content: string) => Promise<boolean>;
  onAnalyzeFile: (file: FileInfo) => Promise<void>;
  error: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  selectedFile,
  onSaveFile,
  onAnalyzeFile,
  error,
}) => {
  const { toast } = useToast();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSaveClick = () => {
    if (selectedFile) {
      setIsSaveDialogOpen(true);
      setFileContent(selectedFile.content || '');
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a file to save.",
        variant: "default"
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
          variant: "default"
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
          variant: "default"
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
        variant: "default"
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        error={error} 
      />

      <div className="border-t pt-3 mt-3">
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted/50 rounded-md text-sm">
            <div className="font-medium">Selected file:</div>
            <div className="text-muted-foreground truncate">{selectedFile.path}</div>
          </div>
        )}
        
        <FileActionButtons 
          selectedFile={selectedFile} 
          isAnalyzing={isAnalyzing}
          onSaveClick={handleSaveClick}
          onAnalyzeClick={handleAnalyzeClick}
        />

        <MessageInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading} 
          placeholder={selectedFile ? `Ask about ${selectedFile.path.split('/').pop()}...` : "Type your message..."}
        />
      </div>

      <FileEditDialog 
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        fileContent={fileContent}
        setFileContent={setFileContent}
        onSave={handleSaveConfirm}
        fileName={selectedFile?.path.split('/').pop() || ""}
      />
    </div>
  );
};

export default ChatInterface;
