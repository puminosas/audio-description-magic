
import React, { useState, useEffect } from 'react';
import { Send, X, RotateCcw, Plus, Loader2 } from 'lucide-react';
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
  const [isSending, setIsSending] = useState(false);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  // Set animation state for send button
  useEffect(() => {
    if (isProcessing) {
      setIsSending(true);
    } else {
      // Give a little delay before removing animation
      const timeout = setTimeout(() => setIsSending(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isProcessing]);

  // Check if input is disabled
  const isInputDisabled = isProcessing || typingStatus === 'processing';

  // Handle send with animation
  const handleSend = () => {
    if (!input.trim() || isInputDisabled) return;
    
    setIsSending(true);
    sendMessage();
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startNewChat}
          disabled={isInputDisabled}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={isInputDisabled}
            className="gap-1 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
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
          className="min-h-[60px] resize-none pr-20 transition-colors focus-visible:ring-1"
          rows={1}
          disabled={isInputDisabled}
          maxLength={4000}
        />
        
        <div className="absolute right-2 top-2 flex space-x-2">
          {input.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setInput('')}
              disabled={isInputDisabled}
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
          
          <Button
            variant={isSending ? "secondary" : "default"}
            size="icon"
            className="h-8 w-8 transition-all"
            onClick={handleSend}
            disabled={!input.trim() || isInputDisabled}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Ask about your project, users, or administrative tasks.
        </p>
        {input.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {input.length}/4000
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
