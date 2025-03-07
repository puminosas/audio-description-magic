
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageVoiceSelector from '@/components/generator/LanguageVoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';

interface ProductDetailsFormProps {
  productName: string;
  setProductName: (value: string) => void;
  productDescription: string;
  setProductDescription: (value: string) => void;
  language: LanguageOption | null;
  setLanguage: (language: LanguageOption) => void;
  voice: VoiceOption | null;
  setVoice: (voice: VoiceOption) => void;
  handleGenerateAudio: () => void;
  loading: boolean;
  googleTtsAvailable: boolean;
}

const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  productName,
  setProductName,
  productDescription,
  setProductDescription,
  language,
  setLanguage,
  voice,
  setVoice,
  handleGenerateAudio,
  loading,
  googleTtsAvailable
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>Enter your product information to generate an audio description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium mb-1">Product Name</label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        <div>
          <label htmlFor="productDescription" className="block text-sm font-medium mb-1">Product Description</label>
          <Textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Enter product description"
            rows={5}
          />
        </div>
        <LanguageVoiceSelector 
          selectedLanguage={language}
          selectedVoice={voice}
          onSelectLanguage={setLanguage}
          onSelectVoice={setVoice}
        />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateAudio} 
          disabled={loading || !language || !voice || !googleTtsAvailable}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate Audio Description'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductDetailsForm;
