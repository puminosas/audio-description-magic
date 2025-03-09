
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PublicFeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('feature_request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('feedback').insert({
        message,
        email: user ? undefined : email, // Only use email field for non-logged in users
        user_id: user?.id,
        type: feedbackType,
        status: 'new'
      });
      
      if (error) throw error;
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setMessage('');
      setEmail('');
      setFeedbackType('feature_request');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your feedback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Select 
              value={feedbackType} 
              onValueChange={setFeedbackType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!user && (
            <div>
              <Input
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
          )}
          
          <div>
            <Textarea
              placeholder="Your feedback message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PublicFeedbackForm;
