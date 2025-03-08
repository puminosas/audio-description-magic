
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type your message..." 
}) => {
  const [input, setInput] = useState('');

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

  return (
    <div className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleEnterPress}
        placeholder={placeholder}
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
  );
};

export default MessageInput;
