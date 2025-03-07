
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DescriptionInput from './DescriptionInput';
import TextToAudioTab from './TextToAudioTab';
import HistoryTab from './HistoryTab';
import { Button } from '@/components/ui/button';
import AudioOutput from './AudioOutput';
import { Loader2 } from 'lucide-react';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { User } from '@supabase/supabase-js';

interface GeneratorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleGenerate: (formData: { text: string; language: LanguageOption; voice: VoiceOption }) => void;
  loading: boolean;
  user: User | null;
  onRefreshStats: () => void;
  generatedAudio: {
    audioUrl?: string;
    text?: string;
    fileName?: string;
  } | null;
}

const GeneratorTabs = ({
  activeTab,
  setActiveTab,
  handleGenerate,
  loading,
  user,
  onRefreshStats,
  generatedAudio
}: GeneratorTabsProps) => {
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <TextToAudioTab 
            onSubmit={handleGenerate}
            loading={loading}
          />
          
          {/* Show audio output when audioUrl is available */}
          {generatedAudio && generatedAudio.audioUrl && (
            <AudioOutput
              audioUrl={generatedAudio.audioUrl}
              text={generatedAudio.text || ''}
              fileName={generatedAudio.fileName || 'audio-description.mp3'}
            />
          )}
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-center text-muted-foreground">
                Generating your audio description...
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <HistoryTab 
            user={user} 
            onRefreshStats={onRefreshStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneratorTabs;
