
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  History, 
  Mic, 
  Settings, 
  Play, 
  Download, 
  Code, 
  FileAudio, 
  AlarmClock,
  Crown,
  Gauge,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

type AudioFile = {
  id: string;
  title: string;
  description: string;
  language: string;
  voice_name: string;
  audio_url: string;
  duration: number | null;
  created_at: string;
};

const Dashboard = () => {
  const { user, loading, profile } = useAuth();
  const [audioHistory, setAudioHistory] = useState<AudioFile[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState({
    used: 0,
    limit: 0,
    percentage: 0
  });
  const { toast } = useToast();
  const audioRef = useState<HTMLAudioElement>(new Audio())[0];

  useEffect(() => {
    if (user) {
      fetchAudioHistory();
      fetchUsageStats();
    }
  }, [user]);

  useEffect(() => {
    const handleEnded = () => {
      setPlayingAudio(null);
    };

    audioRef.addEventListener('ended', handleEnded);

    return () => {
      audioRef.removeEventListener('ended', handleEnded);
      audioRef.pause();
    };
  }, []);

  const fetchAudioHistory = async () => {
    if (!user) return;
    
    try {
      setHistoryLoading(true);
      const { data, error } = await supabaseTyped.audio_files
        .select()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setAudioHistory(data || []);
    } catch (error) {
      console.error('Error fetching audio history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your audio history',
        variant: 'destructive',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    if (!user) return;
    
    try {
      // Get usage count for current day
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabaseTyped.generation_counts
        .select()
        .select('count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
      
      // Determine daily limit based on user's plan
      let dailyLimit = 3; // Free plan
      if (profile?.plan === 'basic') dailyLimit = 10;
      if (profile?.plan === 'premium') dailyLimit = 9999; // "Unlimited"
      
      const usedToday = data?.count || 0;
      const percentage = Math.min(Math.round((usedToday / dailyLimit) * 100), 100);
      
      setUsageStats({
        used: usedToday,
        limit: dailyLimit,
        percentage
      });
      
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const handlePlayPause = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      // Pause currently playing audio
      audioRef.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      audioRef.pause();
      
      // Play new audio
      audioRef.src = audioUrl;
      audioRef.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Failed to play audio file.',
          variant: 'destructive',
        });
      });
      setPlayingAudio(audioUrl);
    }
  };

  const copyEmbedCode = (id: string, audioUrl: string) => {
    const embedCode = `<audio id="audiodesc-${id}" controls><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({
          title: 'Copied!',
          description: 'Embed code copied to clipboard',
        });
      })
      .catch(err => {
        console.error('Error copying text:', err);
        toast({
          title: 'Error',
          description: 'Failed to copy embed code',
          variant: 'destructive',
        });
      });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlanDetails = () => {
    switch(profile?.plan) {
      case 'premium':
        return {
          name: 'Premium',
          icon: <Crown className="h-5 w-5 text-yellow-400" />,
          color: 'bg-yellow-500/20 text-yellow-500',
          description: 'Unlimited audio generations, API access',
          cta: 'Enjoy premium features',
        };
      case 'basic':
        return {
          name: 'Basic',
          icon: <Gauge className="h-5 w-5 text-blue-400" />,
          color: 'bg-blue-500/20 text-blue-500',
          description: '10 audio generations per day, file history',
          cta: 'Upgrade to Premium',
        };
      default:
        return {
          name: 'Free',
          icon: <AlarmClock className="h-5 w-5 text-gray-400" />,
          color: 'bg-gray-500/20 text-gray-500',
          description: '3 audio generations per day',
          cta: 'Upgrade your plan',
        };
    }
  };

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const planDetails = getPlanDetails();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <Gauge className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-2 items-center">
            <History className="h-4 w-4" />
            <span className="hidden md:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Your Plan</CardTitle>
                  {planDetails.icon}
                </div>
                <CardDescription>Current subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${planDetails.color}`}>
                      {planDetails.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{planDetails.description}</p>
                </div>
              </CardContent>
              <CardFooter>
                {profile?.plan !== 'premium' && (
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/pricing">{planDetails.cta}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Usage Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Today's Usage</CardTitle>
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Audio generation credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {usageStats.used} / {usageStats.limit === 9999 ? '∞' : usageStats.limit} generations
                      </span>
                      <span className="text-sm font-medium">
                        {usageStats.percentage}%
                      </span>
                    </div>
                    <Progress value={usageStats.percentage} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile?.plan === 'premium' 
                      ? 'Unlimited generations available' 
                      : `You have ${usageStats.limit - usageStats.used} generations left today`}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/generator">Generate Audio</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* API Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">API Access</CardTitle>
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Integrate with your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {profile?.plan === 'premium' 
                    ? 'You have full API access. Integrate audio descriptions directly into your platform.' 
                    : 'Upgrade to Premium to access our API and integrate audio descriptions into your platform.'}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant={profile?.plan === 'premium' ? 'default' : 'outline'} asChild className="w-full">
                  <Link to="/api">
                    {profile?.plan === 'premium' ? 'View API Docs' : 'Learn More'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Recent History Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Audio Files</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="#" onClick={() => setActiveTab('history')} className="flex items-center gap-1">
                    View All <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : audioHistory.length > 0 ? (
                <div className="space-y-4">
                  {audioHistory.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handlePlayPause(item.audio_url)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileAudio className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No audio files generated yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link to="/generator">Create Your First Audio</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Audio History</CardTitle>
              <CardDescription>All your generated audio descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : audioHistory.length > 0 ? (
                <div className="space-y-4">
                  {audioHistory.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-muted/30">
                      <div className="mb-3 sm:mb-0 flex-1 min-w-0">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm truncate text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10">{item.language}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handlePlayPause(item.audio_url)}>
                          {playingAudio === item.audio_url ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={item.audio_url} download={`${item.title}.mp3`}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => copyEmbedCode(item.id, item.audio_url)}>
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileAudio className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg mb-2">No audio files found</p>
                  <p className="mb-6">You haven't generated any audio descriptions yet.</p>
                  <Button asChild>
                    <Link to="/generator">Generate Your First Audio</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Profile</h3>
                  <div className="flex items-center gap-4 p-4 rounded-md border">
                    <div className="flex-1">
                      <p className="font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" disabled>Edit Profile</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Subscription</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-sm ${planDetails.color}`}>
                          {planDetails.name} Plan
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{planDetails.description}</p>
                    </div>
                    {profile?.plan !== 'premium' && (
                      <Button className="mt-4 sm:mt-0" asChild>
                        <Link to="/pricing">Upgrade</Link>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">API Key</h3>
                  <div className="p-4 rounded-md border">
                    {profile?.plan === 'premium' ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground">Your API key allows you to integrate with our services</p>
                          <Button variant="outline" size="sm">Generate New Key</Button>
                        </div>
                        <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                          <code className="text-xs sm:text-sm font-mono">••••••••••••••••••••••••••••••</code>
                          <Button variant="ghost" size="sm">Show</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">API access is available on the Premium plan</p>
                        <Button asChild>
                          <Link to="/pricing">Upgrade to Premium</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
