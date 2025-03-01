
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import GeneratorForm from '@/components/generator/GeneratorForm';
import HistoryTab from '@/components/generator/HistoryTab';
import TipsCard from '@/components/generator/TipsCard';
import PlanStatus from '@/components/generator/PlanStatus';
import AudioOutput from '@/components/generator/AudioOutput';
import { 
  generateAudioDescription, 
  saveAudioToHistory, 
  updateGenerationCount,
  getUserGenerationStats,
  LanguageOption,
  VoiceOption
} from '@/utils/audioGenerationService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Crown, AlertCircle } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Generator = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl: string;
    text: string;
  } | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [generationStats, setGenerationStats] = useState({ 
    total: 0, 
    today: 0,
    remaining: profile?.remaining_generations || 10
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchGenerationStats();
    }
  }, [user]);

  const fetchGenerationStats = async () => {
    if (!user?.id) return;
    
    try {
      const stats = await getUserGenerationStats(user.id);
      setGenerationStats({
        total: stats.total || 0,
        today: stats.today || 0,
        remaining: profile?.remaining_generations || 10
      });
    } catch (error) {
      console.error("Error fetching generation stats:", error);
    }
  };

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Generating audio with data:", formData);
      
      const result = await generateAudioDescription(
        formData.text,
        formData.language,
        formData.voice
      );
      
      if (result.error || !result.audioUrl) {
        setError(result.error || 'Failed to generate audio. Please try again.');
        throw new Error(result.error || 'Failed to generate audio');
      }
      
      console.log("Audio generation successful:", result);
      
      // Save to history
      if (result.audioUrl) {
        await saveAudioToHistory(
          result.audioUrl,
          result.text,
          formData.language.name,
          formData.voice.name,
          user?.id
        );
        
        // Update generation count for authenticated users
        if (user?.id) {
          await updateGenerationCount(user.id);
          // Refresh stats
          fetchGenerationStats();
        }
      }
      
      setGeneratedAudio({
        audioUrl: result.audioUrl,
        text: result.text
      });
      
      toast({
        title: 'Success!',
        description: 'Your audio description has been generated.',
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate audio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPro = () => {
    // Replace with your actual Paddle Vendor ID
    const paddleVendorId = "123456"; 
    
    try {
      // Open Paddle checkout in a new tab
      const paddleCheckoutUrl = `https://checkout.paddle.com/checkout/product/YOUR_PRODUCT_ID?vendor=${paddleVendorId}&email=${encodeURIComponent(user?.email || '')}`;
      window.open(paddleCheckoutUrl, "_blank");
      
      toast({
        title: "Opening Checkout",
        description: "You're being redirected to complete your purchase",
      });
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast({
        title: "Error",
        description: "Failed to open checkout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFeedbackSuccess = () => {
    setFeedbackOpen(false);
    toast({
      title: "Thank you!",
      description: "Your feedback helps us improve our service.",
    });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Audio Description Generator</h1>
        <p className="text-muted-foreground">
          Create audio descriptions for your e-commerce products
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none bg-muted/50">
                <TabsTrigger value="generate" className="flex-1">Generate</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="p-6">
                <GeneratorForm 
                  onGenerate={handleGenerate} 
                  loading={loading} 
                />
              </TabsContent>
              
              <TabsContent value="history" className="p-6">
                <HistoryTab 
                  user={user} 
                  onRefreshStats={fetchGenerationStats}
                />
              </TabsContent>
            </Tabs>
          </Card>
          
          {generatedAudio && (
            <div className="mt-6">
              <AudioOutput 
                audioUrl={generatedAudio.audioUrl} 
                generatedText={generatedAudio.text} 
                isGenerating={loading}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <PlanStatus 
            user={user} 
            profile={profile}
            remainingGenerations={generationStats.remaining} 
            totalGenerations={generationStats.total}
            todayGenerations={generationStats.today}
          />
          
          {!profile?.plan || profile.plan === 'free' ? (
            <Card className="p-4 border border-primary/20 bg-primary/5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" /> Upgrade to Pro
              </h3>
              <p className="text-sm mt-2 mb-4">
                Get unlimited audio descriptions, premium voices, and priority support.
              </p>
              <Button 
                onClick={handleUpgradeToPro} 
                className="w-full bg-gradient-to-r from-primary to-indigo-600"
              >
                <Crown className="mr-2 h-4 w-4" /> Upgrade Now
              </Button>
            </Card>
          ) : null}
          
          <TipsCard />
          
          {/* Feedback button */}
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
        </div>
      </div>
    </div>
  );
};

export default Generator;
