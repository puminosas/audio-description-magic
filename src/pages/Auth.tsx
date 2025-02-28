
import { useState } from 'react';
import { Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { user, signIn, signUp, signInWithGoogle, loading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>(
    searchParams.get('reset') ? 'reset' : 'login'
  );
  const [authLoading, setAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // For login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // For signup
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // For password reset
  const [resetEmail, setResetEmail] = useState('');

  // Get the return URL from location state or default to '/'
  const from = location.state?.from?.pathname || '/dashboard';

  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Klaida',
        description: 'Įveskite el. paštą ir slaptažodį.',
        variant: 'destructive',
      });
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast({
        title: 'Sėkmingai',
        description: 'Jūs prisijungėte.',
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko prisijungti.',
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !confirmPassword) {
      toast({
        title: 'Klaida',
        description: 'Užpildykite visus privalomus laukus.',
        variant: 'destructive',
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: 'Klaida',
        description: 'Slaptažodžiai nesutampa.',
        variant: 'destructive',
      });
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await signUp(
        signupEmail, 
        signupPassword, 
        { full_name: fullName }
      );
      
      if (error) throw error;
      
      toast({
        title: 'Sėkmingai',
        description: 'Registracija sėkminga! Patikrinkite savo el. paštą, kad patvirtintumėte paskyrą.',
      });
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko užsiregistruoti.',
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
      // No need for success toast as the page will redirect
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko prisijungti su Google.',
        variant: 'destructive',
      });
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: 'Klaida',
        description: 'Įveskite el. paštą.',
        variant: 'destructive',
      });
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) throw error;
      
      setResetSent(true);
      toast({
        title: 'Sėkmingai',
        description: 'Slaptažodžio atkūrimo nuoroda išsiųsta jūsų el. paštu.',
      });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko išsiųsti slaptažodžio atkūrimo nuorodos.',
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Sveiki, AudioDesc naudotojau</h1>
          <p className="text-muted-foreground mt-2">
            Prisijunkite prie savo paskyros arba sukurkite naują
          </p>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup' | 'reset')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Prisijungti</TabsTrigger>
              <TabsTrigger value="signup">Registruotis</TabsTrigger>
              <TabsTrigger value="reset">Atkurti slaptažodį</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Prisijungimas</CardTitle>
                  <CardDescription>
                    Įveskite savo el. paštą ir slaptažodį, kad prisijungtumėte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vardas.pavarde@pavyzdys.lt"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Slaptažodis</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => setActiveTab('reset')}
                  >
                    Pamiršote slaptažodį?
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Jungiamasi...
                      </>
                    ) : (
                      'Prisijungti'
                    )}
                  </Button>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        arba prisijunkite su
                      </span>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Registracija</CardTitle>
                  <CardDescription>
                    Sukurkite naują paskyrą, kad galėtumėte naudotis AudioDesc paslaugomis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Vardas ir pavardė</Label>
                    <Input
                      id="fullName"
                      placeholder="Jonas Jonaitis"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">El. paštas</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="vardas.pavarde@pavyzdys.lt"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Slaptažodis</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Pakartokite slaptažodį</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kuriama paskyra...
                      </>
                    ) : (
                      'Registruotis'
                    )}
                  </Button>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        arba registruokitės su
                      </span>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={handleResetPassword}>
                <CardHeader>
                  <CardTitle>Atkurti slaptažodį</CardTitle>
                  <CardDescription>
                    Įveskite savo el. paštą ir mes atsiųsime jums slaptažodžio atkūrimo nuorodą
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resetSent && (
                    <Alert className="mb-4">
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        Slaptažodžio atkūrimo nuoroda išsiųsta. Patikrinkite savo el. paštą.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">El. paštas</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="vardas.pavarde@pavyzdys.lt"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={authLoading || resetSent}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Siunčiama...
                      </>
                    ) : resetSent ? (
                      'Nuoroda išsiųsta'
                    ) : (
                      'Atkurti slaptažodį'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full" 
                    onClick={() => setActiveTab('login')}
                  >
                    Grįžti į prisijungimą
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
