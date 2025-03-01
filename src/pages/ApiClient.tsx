
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Code, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CodeSnippet from '@/components/api/CodeSnippet';
import ApiKeyDisplay from '@/components/api/ApiKeyDisplay';
import { useAuth } from '@/context/AuthContext';
import AudioPlayer from '@/components/ui/AudioPlayer';

const ApiClient = () => {
  const [apiKey, setApiKey] = useState('');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [voice, setVoice] = useState('alloy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ audioUrl: string; text: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateSampleAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name or description.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ text, language, voice }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      setResult({
        audioUrl: data.audioUrl,
        text: data.text
      });

      toast({
        title: "Success",
        description: "Audio generated successfully!",
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate audio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Code snippet copied to clipboard!",
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">API Client</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test our API directly from this page or copy code snippets to integrate with your applications.
          </p>
        </div>

        <Tabs defaultValue="client" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="client">Test Client</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Audio Sample</CardTitle>
                <CardDescription>
                  Test the API by generating an audio description for a product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name/Description</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      className="w-full p-2 border rounded-md bg-background"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice</Label>
                    <select
                      id="voice"
                      className="w-full p-2 border rounded-md bg-background"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                    >
                      <option value="alloy">Alloy</option>
                      <option value="echo">Echo</option>
                      <option value="fable">Fable</option>
                      <option value="onyx">Onyx</option>
                      <option value="nova">Nova</option>
                      <option value="shimmer">Shimmer</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={generateSampleAudio} 
                  disabled={loading || !apiKey || !text}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Audio
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Generated Description:</h3>
                    <p className="text-sm whitespace-pre-wrap">{result.text}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Audio Output:</h3>
                    <AudioPlayer 
                      audioUrl={result.audioUrl}
                      fileName={`product-description-${Date.now()}.mp3`}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="keys">
            <ApiKeyDisplay />
          </TabsContent>

          <TabsContent value="snippets">
            <Card>
              <CardHeader>
                <CardTitle>Code Snippets</CardTitle>
                <CardDescription>
                  Copy and paste these code snippets to integrate with your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">JavaScript/TypeScript</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyCode(jsCode)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <CodeSnippet code={jsCode} language="javascript" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Python</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyCode(pythonCode)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <CodeSnippet code={pythonCode} language="python" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">cURL</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyCode(curlCode)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <CodeSnippet code={curlCode} language="bash" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Code snippets
const jsCode = `// Using fetch
const generateAudio = async (apiKey, text, language = 'en', voice = 'alloy') => {
  const response = await fetch('https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/generate-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({ text, language, voice }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate audio');
  }

  return response.json();
};

// Example usage
generateAudio('your_api_key', 'Wireless Bluetooth Headphones')
  .then(data => {
    console.log('Generated text:', data.text);
    console.log('Audio URL:', data.audioUrl);
  })
  .catch(error => console.error('Error:', error));`;

const pythonCode = `import requests

def generate_audio(api_key, text, language='en', voice='alloy'):
    url = 'https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/generate-audio'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'text': text,
        'language': language,
        'voice': voice
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code != 200:
        error_data = response.json()
        raise Exception(error_data.get('error', 'Failed to generate audio'))
    
    return response.json()

# Example usage
try:
    result = generate_audio('your_api_key', 'Wireless Bluetooth Headphones')
    print('Generated text:', result['text'])
    print('Audio URL:', result['audioUrl'])
except Exception as e:
    print('Error:', str(e))`;

const curlCode = `curl -X POST 'https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/generate-audio' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer your_api_key' \\
  -d '{
    "text": "Wireless Bluetooth Headphones",
    "language": "en",
    "voice": "alloy"
  }'`;

export default ApiClient;
