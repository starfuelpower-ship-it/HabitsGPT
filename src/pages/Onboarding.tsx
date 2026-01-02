import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Heart,
  Leaf,
  Cat,
  Flame,
  Sun,
  Moon,
  X,
  Feather,
  BookOpen,
  Crown,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SUGGESTED_HABITS = [
  { name: 'Drink water', icon: '💧', category: 'Health' },
  { name: 'Exercise', icon: '💪', category: 'Fitness' },
  { name: 'Read for 15 min', icon: '📚', category: 'Mindset' },
  { name: 'Meditate', icon: '🧘', category: 'Mindset' },
  { name: 'Take a walk', icon: '🚶', category: 'Health' },
  { name: 'Stretch', icon: '🤸', category: 'Fitness' },
  { name: 'Write in journal', icon: '✍️', category: 'Mindset' },
  { name: 'No social media', icon: '📵', category: 'Productivity' },
  { name: 'Early wake up', icon: '☀️', category: 'Health' },
];

const ONBOARDING_KEY = 'daily-reset-onboarding-complete';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [selectedHabits, setSelectedHabits] = useState<typeof SUGGESTED_HABITS>([]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const totalSteps = 5; // Added AI intro step

  // Initialize selectedTheme from current theme
  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme as 'light' | 'dark' | 'system');
    }
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const localComplete = localStorage.getItem(ONBOARDING_KEY);
      if (localComplete === 'true') {
        navigate('/', { replace: true });
        return;
      }

      if (user) {
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (habits && habits.length > 0) {
          localStorage.setItem(ONBOARDING_KEY, 'true');
          navigate('/', { replace: true });
          return;
        }
      }

      setCheckingStatus(false);
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const toggleHabit = (habit: typeof SUGGESTED_HABITS[0]) => {
    setSelectedHabits(prev => {
      const isSelected = prev.find(h => h.name === habit.name);
      if (isSelected) {
        return prev.filter(h => h.name !== habit.name);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, habit];
    });
  };

  // Apply theme immediately when selected
  const handleThemeSelect = (newTheme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Theme is already applied, just persist it
      localStorage.setItem('daily-reset-theme', selectedTheme);

      if (user && selectedHabits.length > 0) {
        for (const habit of selectedHabits) {
          await supabase
            .from('habits')
            .insert({
              user_id: user.id,
              name: habit.name,
              icon: habit.icon,
              category: habit.category,
              archived: false,
            });
        }

        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            theme: selectedTheme,
          });
      }

      localStorage.setItem(ONBOARDING_KEY, 'true');
      toast.success('Welcome to Cozy Habits! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setDirection('next');
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection('prev');
      setStep(step - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    navigate('/');
  };

  const canProceed = () => {
    if (step === 1) return selectedHabits.length > 0;
    return true;
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const getStepColor = () => {
    const colors = [
      'from-amber-400 to-primary',       // Welcome
      'from-emerald-400 to-green-500',   // Choose habits
      'from-violet-400 to-purple-500',   // Theme
      'from-pink-400 to-rose-500',       // Gentle features (AI)
      'from-rose-400 via-amber-500 to-emerald-400', // Ready
    ];
    return colors[step] || colors[0];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-500",
          `bg-gradient-to-br ${getStepColor()}`
        )} />
      </div>

      {/* Skip button */}
      <button
        onClick={skipOnboarding}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
        aria-label="Skip"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar */}
      <div className="p-6 pt-12 relative z-10">
        <div className="flex justify-center items-center mb-2">
          <span className="text-xs text-muted-foreground">{step + 1} of {totalSteps}</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r",
              getStepColor()
            )}
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full overflow-y-auto relative z-10">
        <div className={cn(
          "transition-all duration-200",
          direction === 'next' ? "animate-fade-in" : "animate-fade-in"
        )}>
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="space-y-6 text-center">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                getStepColor()
              )}>
                <Heart className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Welcome to Cozy Habits</h1>
                <p className="text-sm text-muted-foreground">Build habits with a cozy companion</p>
              </div>
              
              <div className="flex items-center justify-center gap-8 py-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                    <Leaf className="w-7 h-7 text-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Grow</span>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                    <Flame className="w-7 h-7 text-amber-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Streak</span>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Cat className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Companion</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Complete habits daily, grow your plant, and care for your cat!
              </p>
            </div>
          )}

          {/* Step 1: Choose Habits */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <h1 className="text-xl font-bold text-foreground">Pick Your Habits</h1>
                <p className="text-sm text-muted-foreground">
                  Choose up to 3 to start
                  <span className="ml-2 text-primary font-medium">({selectedHabits.length}/3)</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {SUGGESTED_HABITS.map((habit) => {
                  const isSelected = selectedHabits.find(h => h.name === habit.name);
                  const isDisabled = !isSelected && selectedHabits.length >= 3;

                  return (
                    <button
                      key={habit.name}
                      onClick={() => toggleHabit(habit)}
                      disabled={isDisabled}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all relative bg-card',
                        isSelected
                          ? 'ring-2 ring-primary bg-primary/10 border-primary/30'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed border-border'
                          : 'hover:bg-muted/50 border-border/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-2xl block">{habit.icon}</span>
                      <p className="font-medium mt-1.5 text-xs text-foreground leading-tight">{habit.name}</p>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Add more habits anytime from the + button
              </p>
            </div>
          )}

          {/* Step 2: Theme */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-xl font-bold text-foreground">Choose Your Theme</h1>
                <p className="text-sm text-muted-foreground">Pick your preferred look</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light' as const, icon: Sun, label: 'Light' },
                  { value: 'dark' as const, icon: Moon, label: 'Dark' },
                  { value: 'system' as const, icon: Monitor, label: 'Auto' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeSelect(value)}
                    className={cn(
                      'p-4 rounded-xl border text-center transition-all bg-card',
                      selectedTheme === value
                        ? 'ring-2 ring-primary bg-primary/10 border-primary/30'
                        : 'hover:bg-muted/50 border-border/50'
                    )}
                  >
                    <Icon className={cn(
                      "w-8 h-8 mx-auto mb-2",
                      selectedTheme === value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Auto follows your device settings
              </p>
            </div>
          )}

          {/* Step 3: Gentle Features (AI) */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br mb-4",
                  getStepColor()
                )}>
                  <Feather className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Gentle Support</h1>
                <p className="text-sm text-muted-foreground">Optional, when you want it</p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Soft features are available if you ever want them — they only respond when you tap a button.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                  <BookOpen className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Gentle reflections</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ask for a soft reflection after journaling — never automatic
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                  <Feather className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Kind suggestions</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Habits can be gently softened to reduce pressure
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-foreground">Available with Pro — explore when ready</span>
              </div>
            </div>
          )}

          {/* Step 4: Ready */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                getStepColor()
              )}>
                <Check className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">You're All Set!</h1>
                <p className="text-sm text-muted-foreground">Start tracking your habits</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-foreground">Tap habits to complete them</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-foreground">Build streaks for bonus points</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Cat className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Tap your cat for cute reactions</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Explore Settings for themes, music & more!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <footer className="p-6 pt-2 relative z-10">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            className={cn(
              "flex-1 gap-2 bg-gradient-to-r text-white shadow-lg",
              getStepColor()
            )}
          >
            {loading ? 'Setting up...' : step === totalSteps - 1 ? "Let's Go!" : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}