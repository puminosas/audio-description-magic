
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock responses for the AI assistant
const AI_RESPONSES = {
  greeting: "Hello! I'm your admin AI assistant. I can help you with managing users, troubleshooting issues, and providing guidance on platform features. How can I assist you today?",
  userManagement: "To manage users, you can go to the Users tab in the admin panel. There you can view, edit, and delete user accounts. You can also update user roles and permissions from the User Update tab.",
  troubleshooting: "I can help you troubleshoot common issues. Could you provide more details about the problem you're experiencing? Common issues might include audio generation failures, user authentication problems, or billing issues.",
  analytics: "The Analytics tab provides insights into platform usage, including total users, generations, and other key metrics. You can filter data by date range to track growth and identify trends.",
  feedback: "User feedback is available in the Feedback tab. You can sort and filter feedback by date, rating, or status. This helps prioritize improvements based on user suggestions.",
  settings: "In the Settings tab, you can configure platform-wide settings such as API rate limits, feature toggles, and notification preferences. Make sure to save changes after modifications.",
  default: "I'm sorry, I don't have specific information about that yet. As your admin AI assistant, my knowledge is primarily focused on helping with platform management tasks. Is there something else I can help with?"
};

const getAIResponse = (message: string) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return AI_RESPONSES.greeting;
  }
  
  if (lowerMsg.includes('user') || lowerMsg.includes('account') || lowerMsg.includes('profile') || lowerMsg.includes('member')) {
    return AI_RESPONSES.userManagement;
  }
  
  if (lowerMsg.includes('problem') || lowerMsg.includes('issue') || lowerMsg.includes('error') || lowerMsg.includes('bug') || lowerMsg.includes('fix')) {
    return AI_RESPONSES.troubleshooting;
  }
  
  if (lowerMsg.includes('analytics') || lowerMsg.includes('stats') || lowerMsg.includes('metrics') || lowerMsg.includes('data')) {
    return AI_RESPONSES.analytics;
  }
  
  if (lowerMsg.includes('feedback') || lowerMsg.includes('review') || lowerMsg.includes('suggestion')) {
    return AI_RESPONSES.feedback;
  }
  
  if (lowerMsg.includes('setting') || lowerMsg.includes('config') || lowerMsg.includes('preference')) {
    return AI_RESPONSES.settings;
  }
  
  return AI_RESPONSES.default;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const AdminAiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: AI_RESPONSES.greeting,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col rounded-lg border">
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-secondary/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p>AI is typing...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            placeholder="Ask me anything about managing your platform..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-12 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The admin AI assistant can help with platform management and user support.
        </p>
      </div>
    </div>
  );
};

export default AdminAiChat;
