
import React from 'react';
import { Send, X, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Message, TypingStatus } from './types';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  sendMessage: () => void;
  isProcessing: boolean;
  typingStatus: TypingStatus;
  messages: Message[];
  handleClearChat: () => void;
  startNewChat: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleKeyDown,
  sendMessage,
  isProcessing,
  typingStatus,
  messages,
  handleClearChat,
  startNewChat
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startNewChat}
          disabled={isProcessing || typingStatus === 'processing'}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Chat
        </Button>
        
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={isProcessing || typingStatus === 'processing'}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or request an admin task..."
          className="min-h-[60px] resize-none pr-20"
          rows={1}
          disabled={isProcessing || typingStatus === 'processing'}
        />
        
        <div className="absolute right-2 top-2 flex space-x-2">
          {input.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setInput('')}
              disabled={isProcessing || typingStatus === 'processing'}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
          
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8"
            onClick={sendMessage}
            disabled={!input.trim() || isProcessing || typingStatus === 'processing'}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        Ask about your project, users, or administrative tasks. AI can analyze your data and help with troubleshooting.
      </p>
    </div>
  );
};

export default ChatInput;
