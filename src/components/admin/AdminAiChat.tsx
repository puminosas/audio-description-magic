
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Send, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const AdminAiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        content: "Hello! I'm your admin assistant. I can help you manage your VoiceFlow AI platform. Ask me about users, configurations, or for help with specific tasks.",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Here we would normally call an API endpoint to get a response from an AI
      // For now, let's simulate a response after a short delay
      setTimeout(() => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: getSimulatedResponse(input),
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('user') && (lowerQuery.includes('list') || lowerQuery.includes('show'))) {
      return "To view all users, go to the Users tab in the admin dashboard. You can filter users by plan type, search by email, and manage their roles from there.";
    }
    
    if (lowerQuery.includes('api key') || lowerQuery.includes('apikey')) {
      return "API keys can be created by premium and admin users. You can view and manage all API keys from the API Keys section. Each key is associated with a specific user.";
    }
    
    if (lowerQuery.includes('audio') || lowerQuery.includes('generation')) {
      return "You can view all audio generations in the Audio Files tab. This shows all files created by users, including temporary files. You can filter by user, date, and other properties.";
    }
    
    if (lowerQuery.includes('error') || lowerQuery.includes('fix')) {
      return "If you're encountering errors, check the console logs first. Common issues include database permissions, missing environment variables, or client-side rendering problems. For specific errors, please provide more details.";
    }
    
    return "I'm here to help with managing your VoiceFlow AI platform. You can ask about users, audio files, configurations, or any administrative tasks. How can I assist you today?";
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Admin AI Assistant
        </CardTitle>
        <CardDescription>
          Get help with administrative tasks and platform management
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 ${
                message.sender === 'assistant' 
                  ? 'bg-muted p-3 rounded-lg' 
                  : 'bg-primary/10 p-3 rounded-lg'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {message.sender === 'assistant' ? (
                  <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-primary" />
                )}
                <span className="text-xs text-muted-foreground">
                  {message.sender === 'assistant' ? 'Assistant' : 'You'}
                  {' • '}
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Ask something about your admin dashboard..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAiChat;
