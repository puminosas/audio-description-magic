
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { History, Play, Key, Settings } from 'lucide-react';
import AudioHistoryItem from '@/components/ui/AudioHistoryItem';

// Simulated user data
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  plan: 'Free',
  remainingGenerations: 2,
  dailyLimit: 3,
  apiKey: '',
};

// Sample audio history data
const sampleAudioHistory = [
  {
    id: '1',
    title: 'iPhone 15 Pro Description',
    description: 'iPhone 15 Pro with A17 Pro chip, titanium design, and 48MP camera system. Available in four finishes. All-day battery life and iOS 17.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    audioUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3',
    language: 'English',
    voiceName: 'Joanna',
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Description',
    description: 'Experience the ultimate in smartphone technology with the Samsung Galaxy S23. Featuring a 6.1-inch Dynamic AMOLED display, Snapdragon 8 Gen 2 processor, and a 50MP camera system.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    audioUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-2.mp3',
    language: 'English',
    voiceName: 'Matthew',
  },
  {
    id: '3',
    title: 'Nike Air Max Description',
    description: 'Nike Air Max shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole. Perfect for running or casual wear.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    audioUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-3.mp3',
    language: 'Spanish',
    voiceName: 'Miguel',
  },
];

const Dashboard = () => {
  const [audioHistory, setAudioHistory] = useState(sampleAudioHistory);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('audio-history');

  const handleDeleteAudio = (id: string) => {
    setAudioHistory(audioHistory.filter(item => item.id !== id));
  };

  const generateNewApiKey = () => {
    // In a real app, this would make a request to your backend
    console.log('Generating new API key...');
    // Simulate API key generation
    setTimeout(() => {
      console.log('New API key generated');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{userData.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Generations Remaining</p>
                  <p className="font-medium">{userData.remainingGenerations} / {userData.dailyLimit}</p>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="audio-history" className="flex gap-2 items-center">
                  <History className="h-4 w-4" />
                  Audio History
                </TabsTrigger>
                <TabsTrigger value="api-keys" className="flex gap-2 items-center">
                  <Key className="h-4 w-4" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex gap-2 items-center">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audio-history" className="space-y-4 mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Audio History</h2>
                  <Button className="gap-1" asChild>
                    <a href="/generator">
                      Generate New <Play className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {audioHistory.length > 0 ? (
                  <div className="space-y-4">
                    {audioHistory.map((item) => (
                      <AudioHistoryItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        createdAt={item.createdAt}
                        audioUrl={item.audioUrl}
                        language={item.language}
                        voiceName={item.voiceName}
                        onDelete={handleDeleteAudio}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glassmorphism rounded-xl">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Audio Files Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't generated any audio descriptions yet.
                    </p>
                    <Button asChild>
                      <a href="/generator">Generate Your First Audio</a>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="api-keys" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.plan === 'Free' ? (
                      <div className="text-center py-8">
                        <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">API Access Unavailable</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                          API access is available only on Premium plans. Upgrade your plan to access our API features.
                        </p>
                        <Button>Upgrade to Premium</Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Your API Key</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? 'Hide' : 'Show'}
                            </Button>
                          </div>
                          <div className="bg-secondary p-3 rounded-md font-mono text-sm">
                            {showApiKey ? 'sk_live_abcdefghijklmnopqrstuvwxyz123456789' : '••••••••••••••••••••••••••••••••'}
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                          <p className="font-medium">Important</p>
                          <p className="mt-1">Keep your API key secure and never share it publicly. If compromised, generate a new key immediately.</p>
                        </div>
                        
                        <div>
                          <p className="font-medium mb-2">Generate New API Key</p>
                          <p className="text-muted-foreground mb-4">
                            This will invalidate your existing API key. Any integrations using the old key will stop working.
                          </p>
                          <Button variant="destructive" onClick={generateNewApiKey}>
                            Generate New Key
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input
                              id="name"
                              type="text"
                              className="w-full p-2 rounded-md border border-input bg-background"
                              defaultValue={userData.name}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                              id="email"
                              type="email"
                              className="w-full p-2 rounded-md border border-input bg-background"
                              defaultValue={userData.email}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
                            <input
                              id="current-password"
                              type="password"
                              className="w-full p-2 rounded-md border border-input bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                            <input
                              id="new-password"
                              type="password"
                              className="w-full p-2 rounded-md border border-input bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
                            <input
                              id="confirm-password"
                              type="password"
                              className="w-full p-2 rounded-md border border-input bg-background"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
