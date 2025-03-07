
import React, { useState, useRef, useEffect } from 'react';
import { Send, Save, FileSearch } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      <ScrollArea className="flex-grow pr-4">
        <div className="flex flex-col space-y-4 p-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}>
              {!message.isUserMessage && (
                <Avatar className="w-8 h-8 mr-3 mt-1">
                  <AvatarImage src="/lovable-uploads/24d92d37-4470-4427-a02c-349aa3e574de.png" alt="AI Avatar" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 text-sm max-w-[80%] ${
                message.isUserMessage 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary'
              }`}>
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <div className="text-xs text-muted-foreground mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start justify-start">
              <Avatar className="w-8 h-8 mr-3 mt-1">
                <AvatarImage src="/lovable-uploads/24d92d37-4470-4427-a02c-349aa3e574de.png" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 text-sm bg-secondary animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          {error && (
            <div className="px-4 py-2 bg-destructive/10 text-destructive rounded-md my-2">
              Error: {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t pt-3 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSaveClick} 
            disabled={!selectedFile}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            Save File
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAnalyzeClick} 
            disabled={!selectedFile || isAnalyzing}
            className="gap-1"
          >
            <FileSearch className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnterPress}
            placeholder="Type your message..."
            className="resize-none min-h-[80px]"
          />
          <Button 
            onClick={handleSendMessageClick} 
            disabled={isLoading || !input.trim()} 
            className="self-end"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                  className="font-mono h-[300px]"
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
