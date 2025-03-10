
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Key, LockKeyhole, FileText, Blocks, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import ApiKeyDisplay from '@/components/api/ApiKeyDisplay';

const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState('getting-started');
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Integrate audio descriptions directly into your e-commerce platform or internal tools.
          </p>
          <div className="flex justify-center mt-8">
            {!user ? (
              <Button asChild>
                <Link to="/auth">Sign In to Get API Keys</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/dashboard">Manage API Keys</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 mb-16 md:flex-row">
          <div className="w-full md:w-64 shrink-0 md:sticky md:top-24 md:self-start">
            <nav className="glassmorphism p-4 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground mb-4">Documentation</p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab('getting-started')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeTab === 'getting-started' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Getting Started
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('authentication')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeTab === 'authentication' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Authentication
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('endpoints')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeTab === 'endpoints' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Endpoints
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('rate-limits')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeTab === 'rate-limits' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Rate Limits
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('manage-keys')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeTab === 'manage-keys' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Manage API Keys
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('sdks')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeTab === 'sdks' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    SDK & Libraries
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex-1">
            <div className="glassmorphism rounded-xl p-6 md:p-8">
              <div className="md:hidden mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="getting-started" className="flex-1">Start</TabsTrigger>
                    <TabsTrigger value="authentication" className="flex-1">Auth</TabsTrigger>
                    <TabsTrigger value="endpoints" className="flex-1">Endpoints</TabsTrigger>
                    <TabsTrigger value="manage-keys" className="flex-1">Keys</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {activeTab === 'getting-started' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Code className="mr-2 h-6 w-6 text-primary" />
                    Getting Started with the API
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Welcome to the Audio Description Generator API. This guide will help you integrate our service into your e-commerce platform or application.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Prerequisites</h3>
                  <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                    <li>A Premium subscription plan</li>
                    <li>Your API key (available in your dashboard)</li>
                    <li>Basic knowledge of REST APIs</li>
                  </ul>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Making Your First Request</h3>
                  <p className="text-muted-foreground mb-4">
                    To make your first API request, you'll need to authenticate using your API key in the request headers and specify the endpoint you want to use.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-md font-mono text-sm mb-6">
                    <p className="mb-2 text-primary">// Example request using cURL</p>
                    <p className="whitespace-pre-wrap">curl -X POST "https://api.audiodescriptions.online/generate"<br />  -H "Authorization: Bearer YOUR_API_KEY"<br />  -H "Content-Type: application/json"<br />  -d '{'{'}
  "text": "Your product description here",
  "language": "en",
  "voice": "female"
{'}'}'</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'authentication' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <LockKeyhole className="mr-2 h-6 w-6 text-primary" />
                    Authentication
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    All API requests must be authenticated using an API key. Your API key is available in your dashboard.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-3">API Key Format</h3>
                  <p className="text-muted-foreground mb-4">
                    Your API key should be included in the Authorization header as a Bearer token:
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-md font-mono text-sm mb-6">
                    <p>Authorization: Bearer YOUR_API_KEY</p>
                  </div>
                  <h3 className="text-xl font-semibold mt-6 mb-3">API Key Security</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                    <p className="font-medium">Important</p>
                    <p className="mt-1">Keep your API key secure and do not expose it in client-side code. Treat it like a password.</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'endpoints' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-primary" />
                    API Endpoints
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    The API provides several endpoints to generate and manage audio descriptions.
                  </p>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Generate Audio</h3>
                      <div className="bg-secondary/30 p-4 rounded-md">
                        <p className="font-medium mb-2">POST /generate</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Generates an audio description for the provided text.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Request Body</p>
                            <div className="bg-secondary/50 p-3 rounded-md font-mono text-xs">
{`{
  "text": "iPhone 15 Pro",
  "language": "en",
  "voice": "female"
}`}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Response</p>
                            <div className="bg-secondary/50 p-3 rounded-md font-mono text-xs">
{`{
  "success": true,
  "audio_url": "https://example.com/audio.mp3",
  "duration": 12.5
}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Get Audio History</h3>
                      <div className="bg-secondary/30 p-4 rounded-md">
                        <p className="font-medium mb-2">GET /audio/history</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Retrieves a list of previously generated audio files.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Query Parameters</p>
                            <div className="bg-secondary/50 p-3 rounded-md font-mono text-xs">
{`page=1&limit=10`}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Response</p>
                            <div className="bg-secondary/50 p-3 rounded-md font-mono text-xs">
{`{
  "success": true,
  "items": [{...}, {...}],
  "page": 1,
  "total_pages": 3
}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'rate-limits' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Key className="mr-2 h-6 w-6 text-primary" />
                    Rate Limits
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    To ensure fair usage of our services, API requests are subject to rate limiting.
                  </p>
                  <div className="bg-secondary/30 p-6 rounded-md mb-6">
                    <h3 className="text-lg font-semibold mb-4">Plan Limits</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-4">Plan</th>
                            <th className="text-left py-2 px-4">Requests per minute</th>
                            <th className="text-left py-2 px-4">Requests per day</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border">
                            <td className="py-2 px-4">Basic</td>
                            <td className="py-2 px-4">10</td>
                            <td className="py-2 px-4">100</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="py-2 px-4">Premium</td>
                            <td className="py-2 px-4">30</td>
                            <td className="py-2 px-4">1,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4">Enterprise</td>
                            <td className="py-2 px-4">100</td>
                            <td className="py-2 px-4">10,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Rate Limit Headers</h3>
                  <p className="text-muted-foreground mb-4">
                    All API responses include headers that indicate your current rate limit status:
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-md font-mono text-sm space-y-2">
                    <p>X-RateLimit-Limit: 100</p>
                    <p>X-RateLimit-Remaining: 95</p>
                    <p>X-RateLimit-Reset: 1665417600</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'manage-keys' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Key className="mr-2 h-6 w-6 text-primary" />
                    Manage API Keys
                  </h2>
                  
                  {!user ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You need to be signed in to manage your API keys.
                      </p>
                      <Button asChild>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                    </div>
                  ) : (
                    <ApiKeyDisplay />
                  )}
                </div>
              )}
              
              {activeTab === 'sdks' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Blocks className="mr-2 h-6 w-6 text-primary" />
                    SDK & Libraries
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We provide official libraries for popular programming languages to make integration easier.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="border border-border rounded-md p-4">
                      <h3 className="text-lg font-semibold mb-2">JavaScript / TypeScript</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Install our official JavaScript client library to easily integrate with your web applications.
                      </p>
                      <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm mb-3">
                        npm install @audiodescriptions/client
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm">
{`import { AudioDescriptionsClient } from '@audiodescriptions/client';

const client = new AudioDescriptionsClient('YOUR_API_KEY');

async function generateAudio() {
  const result = await client.generate({
    text: 'Your product description',
    language: 'en',
    voice: 'female'
  });
  
  console.log(result.audio_url);
}`}
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4">
                      <h3 className="text-lg font-semibold mb-2">PHP</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use our PHP client for easy integration with PHP-based e-commerce platforms.
                      </p>
                      <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm mb-3">
                        composer require audiodescriptions/client
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm">
{`<?php
require_once 'vendor/autoload.php';

$client = new AudioDescriptions\\Client('YOUR_API_KEY');

$result = $client->generate([
    'text' => 'Your product description',
    'language' => 'en',
    'voice' => 'female'
]);

echo $result['audio_url'];`}
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4">
                      <h3 className="text-lg font-semibold mb-2">Python</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Our Python client library makes it easy to integrate with Python applications.
                      </p>
                      <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm mb-3">
                        pip install audiodescriptions
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm">
{`import audiodescriptions

client = audiodescriptions.Client('YOUR_API_KEY')

result = client.generate(
    text='Your product description',
    language='en',
    voice='female'
)

print(result['audio_url'])`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
