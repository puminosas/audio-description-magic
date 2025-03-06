
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileInfo } from '../types';

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

export default ChatInterface;
