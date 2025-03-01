
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Upload, FileText } from 'lucide-react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption, getAvailableLanguages, getAvailableVoices } from '@/utils/audioGenerationService';
import { useToast } from '@/hooks/use-toast';

interface TextToAudioTabProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  user: any;
}

const TextToAudioTab = ({ onGenerate, loading, user }: TextToAudioTabProps) => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(getAvailableLanguages()[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(getAvailableVoices('en')[0]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Update voices based on the language
    setSelectedVoice(getAvailableVoices(language.code)[0]);
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate audio.",
        variant: "destructive"
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter text or upload a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onGenerate({
        text: text.trim(),
        language: selectedLanguage,
        voice: selectedVoice
      });
    } catch (error) {
      console.error("Error in generation:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong during generation.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 1MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type (only .txt files)
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Only plain text (.txt) files are allowed",
        variant: "destructive"
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
        setUploadedFileName(file.name);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read the uploaded file",
        variant: "destructive"
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isDisabled = loading || !text.trim() || !user;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Text to Audio Converter</h2>
        <p className="text-muted-foreground mb-4">Upload a text file or enter text to convert to high-quality audio</p>
        
        {uploadedFileName && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-secondary/20 rounded border">
            <FileText size={16} />
            <span className="text-sm">{uploadedFileName}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-6 text-xs" 
              onClick={() => {
                setText('');
                setUploadedFileName(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Remove
            </Button>
          </div>
        )}
        
        <div className="flex gap-2 mb-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".txt" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={triggerFileInput}
            className="gap-1"
          >
            <Upload size={16} />
            Upload Text File
          </Button>
          <p className="text-xs text-muted-foreground self-center">Supports .txt files up to 1MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DescriptionInput 
          value={text} 
          onChange={handleTextChange} 
        />
        
        <LanguageVoiceSelector 
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          onSelectLanguage={handleSelectLanguage}
          onSelectVoice={handleSelectVoice}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isDisabled}
          className="gap-1"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Wand2 size={18} />
          )}
          {loading 
            ? "Generating..." 
            : !user 
              ? "Sign in to Generate" 
              : !text.trim() 
                ? "Enter text first" 
                : "Convert to Audio"}
        </Button>
      </div>
    </div>
  );
};

export default TextToAudioTab;
