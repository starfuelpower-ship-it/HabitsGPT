import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Cat, 
  Coins, 
  ChevronRight,
  X,
  Leaf,
  Heart,
  Check,
  Plus,
  Flame,
  BookOpen,
  Feather,
  Crown,
  Smartphone
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const TUTORIAL_KEY = 'cozy_habits_tutorial_seen';

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  color: string;
}

interface AppTutorialProps {
  onComplete: () => void;
}

export function AppTutorial({ onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // 5 steps including AI features introduction
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      icon: <Heart className="w-8 h-8" />,
      title: 'Welcome!',
      subtitle: 'Your cozy habit companion',
      color: 'from-amber-400 to-primary',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm text-center">
            Build habits, grow your plant, and care for your cat companion.
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">Grow</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-1">
                <Flame className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                <Cat className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Companion</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'habits',
      icon: <Check className="w-8 h-8" />,
      title: 'Track Habits',
      subtitle: 'Build consistency',
      color: 'from-emerald-400 to-green-500',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground">Tap + to add habits</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-sm text-foreground">Tap to complete daily</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-foreground">Build streaks for bonuses</span>
          </div>
        </div>
      ),
    },
    {
      id: 'companion',
      icon: <Cat className="w-8 h-8" />,
      title: 'Your Cat',
      subtitle: 'A friend who celebrates with you',
      color: 'from-amber-400 to-primary',
      content: (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
              <span className="text-3xl">🐱</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Reacts when you complete habits</p>
            <p className="flex items-center gap-2"><Cat className="w-4 h-4 text-primary" /> Tap for cute sounds & animations</p>
            <p className="flex items-center gap-2"><Coins className="w-4 h-4 text-amber-500" /> Earn points for outfits</p>
          </div>
        </div>
      ),
    },
    {
      id: 'gentle-features',
      icon: <Feather className="w-8 h-8" />,
      title: 'Gentle Support',
      subtitle: 'Optional, when you want it',
      color: 'from-violet-400 to-purple-500',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Soft features are here if you ever want them — never automatic, always optional.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <BookOpen className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Gentle reflections</p>
                <p className="text-xs text-muted-foreground">Ask for a soft reflection after journaling</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Feather className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Kind suggestions</p>
                <p className="text-xs text-muted-foreground">Habits can be gently softened to reduce pressure</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Available with Pro</span>
          </div>
        </div>
      ),
    },
    {
      id: 'widgets',
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Stay Close',
      subtitle: 'Optional home screen widgets',
      color: 'from-sky-400 to-blue-500',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Add cozy widgets to keep your cat and progress nearby — only if you want to.
          </p>
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border/30 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <Cat className="w-6 h-6 text-primary mx-auto mb-1" />
                <span className="text-[8px] text-muted-foreground">Widget</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Find widgets in Settings → Widgets anytime
          </p>
        </div>
      ),
    },
    {
      id: 'finish',
      icon: <Sparkles className="w-8 h-8" />,
      title: "You're Ready!",
      subtitle: 'Start your cozy journey',
      color: 'from-rose-400 via-amber-500 to-emerald-400',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-sm text-foreground">Add your first habit</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-sm text-foreground">Check in daily</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-sm text-foreground">Watch everything grow!</span>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setTimeout(onComplete, 200);
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm animate-fade-in">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentStep ? 'w-6 bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg animate-scale-in">
          {/* Icon */}
          <div className={cn(
            "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-4 bg-gradient-to-br",
            step.color
          )}>
            {step.icon}
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
            {step.subtitle && (
              <p className="text-sm text-muted-foreground">{step.subtitle}</p>
            )}
          </div>

          {/* Step content */}
          <div className="mb-6">
            {step.content}
          </div>

          {/* Continue button */}
          <Button
            onClick={handleNext}
            className={cn(
              "w-full gap-2 text-white bg-gradient-to-r",
              step.color
            )}
          >
            {currentStep === tutorialSteps.length - 1 ? "Let's Go!" : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(TUTORIAL_KEY) === 'true';
    if (!hasSeen) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY);
    setShowTutorial(true);
  };

  return { showTutorial, completeTutorial, resetTutorial };
}