
import { useState } from 'react';
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
  LanguageOption,
  VoiceOption
} from '@/utils/audioGenerationService';
import { useToast } from '@/hooks/use-toast';

const Generator = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl: string;
    description: string;
  } | null>(null);

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => {
    try {
      setLoading(true);
      
      const result = await generateAudioDescription(
        formData.text,
        formData.language,
        formData.voice
      );
      
      if (result.error || !result.audioUrl || !result.text) {
        throw new Error(result.error || 'Failed to generate audio');
      }
      
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
        }
      }
      
      setGeneratedAudio({
        audioUrl: result.audioUrl,
        description: result.text
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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Audio Description Generator</h1>
        <p className="text-muted-foreground">
          Create audio descriptions for your e-commerce products
        </p>
      </div>

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
                <HistoryTab user={user} />
              </TabsContent>
            </Tabs>
          </Card>
          
          {generatedAudio && (
            <div className="mt-6">
              <AudioOutput 
                audioUrl={generatedAudio.audioUrl} 
                description={generatedAudio.description} 
              />
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <PlanStatus 
            user={user} 
            profile={profile}
            remainingGenerations={profile?.remaining_generations || 10} 
          />
          <TipsCard />
        </div>
      </div>
    </div>
  );
};

export default Generator;
