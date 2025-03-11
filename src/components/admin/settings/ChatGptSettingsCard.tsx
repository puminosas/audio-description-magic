
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";
import { type AppSettings } from '@/hooks/useAdminSettings';

const modelInfoData = {
  'gpt-3.5-turbo': {
    description: 'Suitable for a wide range of language tasks with good balance of speed and quality',
    costPer1kTokens: '$0.0005 - $0.0015',
    contextWindow: '4K tokens',
    trainingData: 'Up to Sep 2021',
    strengths: 'Fast, cost-effective, good for most common description tasks',
    limitations: 'Less nuanced than GPT-4 models, more limited reasoning'
  },
  'gpt-4o-mini': {
    description: 'A compact but capable version of GPT-4o, optimized for efficiency',
    costPer1kTokens: '$0.0015 - $0.0030',
    contextWindow: '8K tokens',
    trainingData: 'Up to Apr 2023',
    strengths: 'Better quality than GPT-3.5 with reasonable cost and speed',
    limitations: 'Less powerful than full GPT-4o'
  },
  'gpt-4o': {
    description: 'OpenAI\'s most advanced model with optimal balance of intelligence and speed',
    costPer1kTokens: '$0.005 - $0.015',
    contextWindow: '128K tokens',
    trainingData: 'Up to Apr 2023',
    strengths: 'Highest quality descriptions, best reasoning, most accurate',
    limitations: 'Most expensive option, may be unnecessary for simple descriptions'
  }
};

interface ChatGptSettingsCardProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const ChatGptSettingsCard: React.FC<ChatGptSettingsCardProps> = ({ settings, setSettings }) => {
  const [temperature, setTemperature] = useState(settings.chatGptTemperature || 0.7);
  
  const handleModelChange = (value: string) => {
    setSettings({
      ...settings,
      chatGptModel: value
    });
  };
  
  const handleTemperatureChange = (value: number[]) => {
    const newTemp = value[0];
    setTemperature(newTemp);
    setSettings({
      ...settings,
      chatGptTemperature: newTemp
    });
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      chatGptPrompt: e.target.value
    });
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>ChatGPT Settings</CardTitle>
        <CardDescription>
          Configure the AI model and parameters used for generating product descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="model">Model Selection</Label>
          <Select 
            value={settings.chatGptModel} 
            onValueChange={handleModelChange}
          >
            <SelectTrigger id="model" className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent 
              className="w-full bg-background border border-input"
              position="popper"
              align="start"
              sideOffset={4}
            >
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            </SelectContent>
          </Select>
          
          <Accordion type="single" collapsible className="w-full mt-2">
            <AccordionItem value="model-info">
              <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                <Info className="inline-block mr-1 h-4 w-4" /> 
                Model information
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                <div className="p-4 bg-muted rounded-md space-y-2">
                  {settings.chatGptModel && modelInfoData[settings.chatGptModel as keyof typeof modelInfoData] ? (
                    <>
                      <p><strong>Description:</strong> {modelInfoData[settings.chatGptModel as keyof typeof modelInfoData].description}</p>
                      <p><strong>Cost:</strong> {modelInfoData[settings.chatGptModel as keyof typeof modelInfoData].costPer1kTokens} per 1k tokens</p>
                      <p><strong>Context Window:</strong> {modelInfoData[settings.chatGptModel as keyof typeof modelInfoData].contextWindow}</p>
                      <p><strong>Training Data:</strong> {modelInfoData[settings.chatGptModel as keyof typeof modelInfoData].trainingData}</p>
                      <p><strong>Strengths:</strong> {modelInfoData[settings.chatGptModel as keyof typeof modelInfoData].strengths}</p>
                      <p><strong>Limitations:</strong> {modelInfoData[settings.chatGptModel as keyof typeof modelInfoData].limitations}</p>
                    </>
                  ) : (
                    <p>Select a model to see detailed information</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
          </div>
          <Slider 
            id="temperature"
            min={0} 
            max={1} 
            step={0.1} 
            value={[temperature]} 
            onValueChange={handleTemperatureChange}
          />
          <p className="text-xs text-muted-foreground">
            Lower values (0.0-0.3) produce more consistent, focused descriptions. 
            Higher values (0.7-1.0) produce more varied, creative descriptions.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <Textarea 
            id="system-prompt" 
            placeholder="Enter the system prompt used for generating descriptions" 
            className="min-h-[150px] font-mono text-sm"
            value={settings.chatGptPrompt}
            onChange={handlePromptChange}
          />
          <p className="text-xs text-muted-foreground">
            This prompt instructs the model on how to generate product descriptions. 
            Variables like {`{language}`} and {`{voice_name}`} will be replaced with the user's selected values.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatGptSettingsCard;
