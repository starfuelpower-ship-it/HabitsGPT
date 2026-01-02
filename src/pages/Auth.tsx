import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail, Phone, Chrome, KeyRound, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

type AuthMode = 'select' | 'email-password' | 'magic-link' | 'phone' | 'phone-verify';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Please enter a valid phone number with country code (e.g., +1234567890)');

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('select');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  const supabaseAuthProvidersUrl = supabaseProjectId
    ? `https://supabase.com/dashboard/project/${supabaseProjectId}/auth/providers`
    : undefined;
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string }>({});
  
  const { signIn, signUp, signInWithGoogle, signInWithPhone, verifyPhoneOTP, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const resetState = useCallback(() => {
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp('');
    setErrors({});
    setMagicLinkSent(false);
  }, []);

  const handleBack = useCallback(() => {
    if (mode === 'phone-verify') {
      setMode('phone');
      setOtp('');
    } else if (mode !== 'select') {
      setMode('select');
      resetState();
    } else {
      navigate('/');
    }
  }, [mode, navigate, resetState]);

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const msg = error.message || 'Failed to sign in with Google';
        if (msg.toLowerCase().includes('provider is not enabled')) {
          toast.error(
            supabaseAuthProvidersUrl
              ? `Google sign-in is not enabled in Supabase yet. Open Supabase → Auth → Providers and enable Google: ${supabaseAuthProvidersUrl}`
              : 'Google sign-in is not enabled in Supabase yet. Open Supabase → Auth → Providers and enable Google.'
          );
        } else {
          toast.error(msg);
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Sign In
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    
    const newErrors: { email?: string; password?: string } = {};
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Try signing in.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created! Check your email to confirm.');
        navigate('/');
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Magic Link
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast.error(error.message || 'Failed to send magic link');
        return;
      }
      setMagicLinkSent(true);
      toast.success('Check your email for the magic link!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Phone OTP Request
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setErrors({ phone: result.error.errors[0].message });
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const { error } = await signInWithPhone(phone);
      if (error) {
        if (error.message.includes('rate limit')) {
          toast.error('Too many attempts. Please wait a moment.');
        } else {
          toast.error(error.message || 'Failed to send verification code');
        }
        return;
      }
      setMode('phone-verify');
      toast.success('Verification code sent!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Phone OTP Verify
  const handleOTPVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyPhoneOTP(phone, otp);
      if (error) {
        if (error.message.includes('expired')) {
          toast.error('Code expired. Please request a new one.');
        } else if (error.message.includes('invalid')) {
          toast.error('Invalid code. Please try again.');
        } else {
          toast.error(error.message || 'Verification failed');
        }
        return;
      }
      toast.success('Welcome!');
      navigate('/');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  }, []);

  // Auth Method Selection Screen
  const renderSelectMode = () => (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full h-14 gap-3 text-base rounded-xl border-2 hover:bg-primary/5"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Chrome className="w-5 h-5" />
            Continue with Google
          </>
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full h-14 gap-3 text-base rounded-xl border-2 hover:bg-primary/5"
        onClick={() => setMode('phone')}
        disabled={isLoading}
      >
        <Phone className="w-5 h-5" />
        Continue with Phone
      </Button>

      <Button
        variant="outline"
        className="w-full h-14 gap-3 text-base rounded-xl border-2 hover:bg-primary/5"
        onClick={() => setMode('magic-link')}
        disabled={isLoading}
      >
        <Mail className="w-5 h-5" />
        Continue with Email (Magic Link)
      </Button>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full h-12 gap-2 text-base rounded-xl"
        onClick={() => setMode('email-password')}
        disabled={isLoading}
      >
        <KeyRound className="w-4 h-4" />
        Sign in with Password
      </Button>
    </div>
  );

  // Email/Password Form
  const renderEmailPasswordMode = () => (
    <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          className={`h-12 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          className={`h-12 rounded-xl ${errors.password ? 'border-destructive' : ''}`}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSignUp ? (
          'Create Account'
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-primary hover:underline"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>
  );

  // Magic Link Form
  const renderMagicLinkMode = () => (
    <div className="space-y-4">
      {!magicLinkSent ? (
        <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              className={`h-12 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send Magic Link
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Click the link in your email to sign in. You can close this page.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="text-sm"
          >
            Use a different email
          </Button>
        </div>
      )}
    </div>
  );

  // Phone Number Form
  const renderPhoneMode = () => (
    <form onSubmit={handlePhoneSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1234567890"
          value={phone}
          onChange={handlePhoneChange}
          className={`h-12 rounded-xl ${errors.phone ? 'border-destructive' : ''}`}
          autoComplete="tel"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Include your country code (e.g., +1 for US)
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Send Verification Code
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );

  // OTP Verification Form
  const renderPhoneVerifyMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to <strong>{phone}</strong>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        onClick={handleOTPVerify}
        className="w-full h-12 rounded-xl text-base"
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Verify & Sign In'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => handlePhoneSubmit({ preventDefault: () => {} } as React.FormEvent)}
          className="text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          Resend code
        </button>
      </div>
    </div>
  );

  const getModeTitle = () => {
    switch (mode) {
      case 'email-password':
        return isSignUp ? 'Create Account' : 'Sign In';
      case 'magic-link':
        return 'Magic Link';
      case 'phone':
        return 'Phone Sign In';
      case 'phone-verify':
        return 'Verify Code';
      default:
        return 'Welcome';
    }
  };

  const getModeSubtitle = () => {
    switch (mode) {
      case 'email-password':
        return isSignUp ? 'Create an account to sync your habits' : 'Welcome back';
      case 'magic-link':
        return 'Sign in with a magic link sent to your email';
      case 'phone':
        return "We'll text you a verification code";
      case 'phone-verify':
        return 'Enter the code we sent you';
      default:
        return 'Choose how to sign in';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Cozy Habits</h1>
            <p className="mt-2 text-lg font-medium text-foreground">{getModeTitle()}</p>
            <p className="mt-1 text-muted-foreground">{getModeSubtitle()}</p>
          </div>

          {mode === 'select' && renderSelectMode()}
          {mode === 'email-password' && renderEmailPasswordMode()}
          {mode === 'magic-link' && renderMagicLinkMode()}
          {mode === 'phone' && renderPhoneMode()}
          {mode === 'phone-verify' && renderPhoneVerifyMode()}
        </div>
      </div>
    </div>
  );
}
