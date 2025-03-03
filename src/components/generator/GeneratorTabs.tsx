
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneratorForm from '@/components/generator/GeneratorForm';
import HistoryTab from '@/components/generator/HistoryTab';
import TextToAudioTab from '@/components/generator/TextToAudioTab';
import { LanguageOption, VoiceOption } from '@/utils/audio';

interface GeneratorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  user: any;
  onRefreshStats: () => Promise<void>;
}

const GeneratorTabs = ({ 
  activeTab, 
  setActiveTab, 
  handleGenerate, 
  loading, 
  user,
  onRefreshStats
}: GeneratorTabsProps) => {
  return (
    <Card className="overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full rounded-none bg-muted/50 flex-wrap justify-center md:justify-start">
          <TabsTrigger value="generate" className="flex-1 max-w-[150px]">Generate</TabsTrigger>
          <TabsTrigger value="text-to-audio" className="flex-1 max-w-[150px]">Text to Audio</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 max-w-[150px]">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="p-4 md:p-6">
          <GeneratorForm 
            onGenerate={handleGenerate} 
            loading={loading} 
          />
        </TabsContent>
        
        <TabsContent value="text-to-audio" className="p-4 md:p-6">
          <TextToAudioTab 
            onGenerate={handleGenerate} 
            loading={loading}
            user={user}
          />
        </TabsContent>
        
        <TabsContent value="history" className="p-4 md:p-6">
          <HistoryTab 
            user={user} 
            onRefreshStats={onRefreshStats}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default GeneratorTabs;
