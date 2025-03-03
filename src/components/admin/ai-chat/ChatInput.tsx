
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw, Plus } from 'lucide-react';
import { Message, TypingStatus } from './types';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
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
  return (
    <div className="mt-4">
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI assistant..."
          className="min-h-[80px] resize-none pr-12"
          disabled={typingStatus === 'processing'}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2"
          onClick={sendMessage}
          disabled={isProcessing || !input.trim() || typingStatus === 'processing'}
        >
          {typingStatus === 'processing' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewChat}
            className="h-7 px-2 text-xs"
          >
            <Plus className="mr-1 h-3 w-3" />
            New Chat
          </Button>
          
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
        
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
