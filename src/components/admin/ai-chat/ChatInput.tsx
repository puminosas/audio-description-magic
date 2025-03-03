
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw } from 'lucide-react';
import { Message } from './types';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  sendMessage: () => void;
  isProcessing: boolean;
  messages: Message[];
  handleClearChat: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleKeyDown,
  sendMessage,
  isProcessing,
  messages,
  handleClearChat
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
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2"
          onClick={sendMessage}
          disabled={isProcessing || !input.trim()}
        >
          {isProcessing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line
        </p>
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
    </div>
  );
};

export default ChatInput;
