import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Mail, Lock, User, Loader2, Zap, GraduationCap, Shield, ArrowLeft, KeyRound } from 'lucide-react';

type Role = 'student' | 'parent' | null;
type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function Auth() {
  const [role, setRole] = useState<Role>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({ 
          title: 'Reset email sent', 
          description: 'Check your inbox for the password reset link.' 
        });
        setAuthMode('login');
      } else if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { 
              full_name: fullName,
              role: role,
            }
          }
        });
        if (error) throw error;

        // Create profile with role and parent PIN if applicable
        if (data.user) {
          await supabase.from('profiles').upsert({
            user_id: data.user.id,
            full_name: fullName,
            role: role,
            parent_password: role === 'parent' ? parentPin : null,
          }, { onConflict: 'user_id' });
        }

        toast({ title: 'Account created!', description: 'You can now log in.' });
        setAuthMode('login');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Role Selection Screen
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Ambient glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-focus/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success/10 rounded-full blur-[100px]" />
        </div>

        <div className="glass-card p-8 rounded-2xl w-full max-w-lg animate-scale-in relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to FocusAI</h1>
            <p className="text-muted-foreground text-sm">Who are you?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole('student')}
              className="glass-card p-6 rounded-xl hover:ring-2 hover:ring-focus transition-all text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-focus/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-focus" />
              </div>
              <h3 className="font-semibold mb-1">I am a Student</h3>
              <p className="text-xs text-muted-foreground">Track my learning & focus</p>
            </button>

            <button
              onClick={() => setRole('parent')}
              className="glass-card p-6 rounded-xl hover:ring-2 hover:ring-warning transition-all text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-semibold mb-1">I am a Parent</h3>
              <p className="text-xs text-muted-foreground">Monitor my child's progress</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-focus/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success/10 rounded-full blur-[100px]" />
      </div>

      <div className="glass-card p-8 rounded-2xl w-full max-w-md animate-scale-in relative z-10">
        {/* Back button */}
        <button
          onClick={() => setRole(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change role
        </button>

        <div className="text-center mb-8">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
            role === 'student' ? "bg-focus/20" : "bg-warning/20"
          )}>
            {role === 'student' ? (
              <GraduationCap className="w-8 h-8 text-focus" />
            ) : (
              <Shield className="w-8 h-8 text-warning" />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {authMode === 'forgot-password' ? 'Reset Password' : 
             authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {authMode === 'forgot-password' ? 'Enter your email to receive a reset link' :
             authMode === 'login' ? `Sign in as ${role}` : `Create your ${role} account`}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your name"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{role === 'parent' ? 'Parent Email' : 'Email'}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {authMode !== 'forgot-password' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-xs text-focus hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && role === 'parent' && (
            <div className="space-y-2">
              <Label htmlFor="parentPin">Parent Access PIN</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="parentPin"
                  type="password"
                  placeholder="Set a secure PIN"
                  className="pl-10"
                  value={parentPin}
                  onChange={(e) => setParentPin(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              <p className="text-xs text-muted-foreground">This PIN protects access to the parent dashboard</p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {authMode === 'forgot-password' ? 'Send Reset Link' :
             authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {authMode !== 'forgot-password' && (
          <>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-6 text-center">
          {authMode === 'forgot-password' ? (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
