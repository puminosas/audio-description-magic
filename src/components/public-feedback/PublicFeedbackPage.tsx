
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import PublicFeedbackList from './PublicFeedbackList';
import PublicFeedbackForm from './PublicFeedbackForm';

const PublicFeedbackPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">User Feedback</h1>
        <p className="text-muted-foreground">
          See what others are saying about our platform and share your own thoughts
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <PublicFeedbackForm />
        </div>
        
        <div>
          <PublicFeedbackList />
        </div>
      </div>
    </div>
  );
};

export default PublicFeedbackPage;
