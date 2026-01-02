import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try { return localStorage.getItem('rememberMe') !== 'false'; } catch { return true; }
  });

  // Per your request: keep it simple. Remember-me is always enabled (persistent session).

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!email || !password) {
        toast({ title: 'Missing info', description: 'Please enter an email and password.' });
        return;
      }

      if (mode === 'signup') {
        await signUp(email.trim(), password);
        toast({
          title: 'Check your email',
          description: 'We sent a confirmation email. After confirming, come back and sign in.',
        });
        setMode('signin');
      } else {
        await signIn(email.trim(), password);
        navigate('/');
      // Ensure UI picks up the fresh session immediately
      setTimeout(() => window.location.reload(), 50);
      }
    } catch (err: any) {
      const message =
        err?.message ||
        (mode === 'signup'
          ? 'Could not create your account. Try a different email or a stronger password.'
          : 'Could not sign in. Check your email/password and try again.');
      toast({ title: 'Authentication failed', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'signin' ? 'Sign in' : 'Create your account'}</CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Use your email + password to continue.'
              : 'Create an account with email + password.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>

	            <div className="flex items-center justify-between">
	              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => {
                    const next = v === true;
                    setRememberMe(next);
                    try { localStorage.setItem('rememberMe', next ? 'true' : 'false'); } catch {}
                  }}
                />
	                <span
	                  onClick={(e) => {
	                    // Radix Checkbox doesn't automatically toggle from label text in all cases.
	                    e.preventDefault();
	                    const next = !rememberMe;
	                    setRememberMe(next);
	                    try { localStorage.setItem('rememberMe', next ? 'true' : 'false'); } catch {}
	                  }}
	                >
	                  Remember me
	                </span>
              </label>

              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                disabled={isSubmitting}
              >
                {mode === 'signin' ? 'Create account' : 'Back to sign in'}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Google, phone, and magic-link sign-in have been disabled for now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;