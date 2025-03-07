
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextToAudioTab from './TextToAudioTab';
import HistoryTab from './HistoryTab';
import { Loader2 } from 'lucide-react';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { User } from '@supabase/supabase-js';
import AudioOutput from './AudioOutput';

interface GeneratorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleGenerate: (formData: { text: string; language: LanguageOption; voice: VoiceOption }) => Promise<void>;
  loading: boolean;
  user: User | null;
  onRefreshStats: () => Promise<void>;
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
            onGenerate={handleGenerate}
            loading={loading}
            user={user}
          />
          
          {/* Show audio output when audioUrl is available and we're on generate tab */}
          {activeTab === 'generate' && generatedAudio && generatedAudio.audioUrl && (
            <AudioOutput
              audioUrl={generatedAudio.audioUrl}
              generatedText={generatedAudio.text || ''}
              isGenerating={false}
              error={null}
              fileName={generatedAudio.fileName || 'audio-description.mp3'}
            />
          )}
          
          {activeTab === 'generate' && loading && (
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
