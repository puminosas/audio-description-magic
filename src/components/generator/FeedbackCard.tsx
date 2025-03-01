
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FeedbackCard = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { toast } = useToast();
  
  const handleFeedbackSuccess = () => {
    setFeedbackOpen(false);
    toast({
      title: "Thank you!",
      description: "Your feedback helps us improve our service.",
    });
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">We Value Your Feedback</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Help us improve our product by sharing your thoughts.
      </p>
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Share Feedback
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Your insights help us improve our product.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm onSuccess={handleFeedbackSuccess} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FeedbackCard;
