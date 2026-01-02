import { Lock, Flame, Leaf, CheckCircle2, Heart, Sparkles, Cat } from 'lucide-react';
import { usePremium } from '@/contexts/PremiumContext';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface WidgetProps {
  className?: string;
}

// Breathing animation style for gentle glow effect
const breathingGlow = "animate-[pulse_4s_ease-in-out_infinite]";

// Small Widget - Next Habit (cozy, warm tone)
const SmallWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[158px] h-[158px] rounded-[22px] p-3 flex flex-col justify-between relative overflow-hidden",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    {/* Subtle ambient glow */}
    <div className={cn(
      "absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl",
      breathingGlow
    )} />
    
    <div className="flex items-center justify-between relative z-10">
      <span className="text-2xl">🌅</span>
      <Heart className="w-3.5 h-3.5 text-primary/60" />
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Waiting for you</p>
      <p className="text-sm font-semibold text-foreground leading-tight">Morning Walk</p>
      <p className="text-xs text-primary/80 font-medium">Ready when you are</p>
    </div>
  </div>
);

// Medium Widget - Today's Progress (warm, encouraging)
const MediumWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[338px] h-[158px] rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    {/* Subtle ambient particles */}
    <div className={cn(
      "absolute top-4 right-16 w-2 h-2 rounded-full bg-primary/30",
      breathingGlow
    )} />
    <div className={cn(
      "absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-[pulse_5s_ease-in-out_infinite]"
    )} />
    
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">You showed up today</p>
        <p className="text-lg font-bold text-foreground">5 of 7 completed</p>
      </div>
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeDasharray={`${(5/7) * 150.8} 150.8`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </span>
      </div>
    </div>
    <div className="flex gap-1.5 relative z-10">
      {[true, true, true, true, true, false, false].map((done, i) => (
        <div 
          key={i} 
          className={cn(
            "flex-1 h-2 rounded-full transition-all duration-500",
            done ? "bg-primary" : "bg-muted"
          )} 
        />
      ))}
    </div>
  </div>
);

// Large Widget - Streak and Plant (alive, cozy)
const LargeWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[338px] h-[338px] rounded-[22px] p-5 flex flex-col justify-between relative overflow-hidden",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    {/* Ambient glow behind plant */}
    <div className={cn(
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-primary/5 blur-3xl",
      breathingGlow
    )} />
    
    <div className="relative z-10">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cozy Habits</p>
      <p className="text-xl font-bold text-foreground mt-1">Still growing together</p>
    </div>
    
    {/* Plant illustration with subtle animation */}
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="relative">
        <div className={cn(
          "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center",
          "animate-[pulse_6s_ease-in-out_infinite]"
        )}>
          <Leaf className="w-12 h-12 text-primary" />
        </div>
        {/* Cat peeking */}
        <div className={cn(
          "absolute -bottom-1 -right-3 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center",
          "animate-[bounce_3s_ease-in-out_infinite]"
        )} style={{ animationDuration: '4s' }}>
          <Cat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className={cn(
          "absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center",
          breathingGlow
        )}>
          <span className="text-lg">✨</span>
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-3 gap-3 relative z-10">
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Flame className="w-4 h-4" />
          <span className="font-bold text-lg">12</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Days together</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-bold text-lg">85%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">This week</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Heart className="w-4 h-4" />
          <span className="font-bold text-lg">21</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Best streak</p>
      </div>
    </div>
  </div>
);

// Widget with premium lock overlay
const LockedWidget = ({ 
  children, 
  size 
}: { 
  children: React.ReactNode; 
  size: 'small' | 'medium' | 'large';
}) => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-60 blur-[2px] pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[1px] rounded-[22px]">
        <Lock className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground font-medium mb-2">Premium</p>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-3"
          onClick={() => navigate('/premium')}
        >
          Unlock
        </Button>
      </div>
    </div>
  );
};

export const WidgetPreviews = () => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const { checkAndAwardAchievements } = useAchievements();

  // Award achievement for visiting widgets page
  useEffect(() => {
    checkAndAwardAchievements({ widgetsViewed: true });
  }, [checkAndAwardAchievements]);

  return (
    <div className="space-y-6">
      {/* Header with warm copy */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Home Screen Widgets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Keep your cat and progress gently close
        </p>
      </div>

      {/* Small Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Small</span>
          <span className="text-xs text-muted-foreground">• A gentle reminder</span>
        </div>
        <div className="flex justify-center">
          <LockedWidget size="small">
            <SmallWidget />
          </LockedWidget>
        </div>
      </div>

      {/* Medium Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Medium</span>
          <span className="text-xs text-muted-foreground">• See your progress</span>
        </div>
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4">
          <LockedWidget size="medium">
            <MediumWidget />
          </LockedWidget>
        </div>
      </div>

      {/* Large Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Large</span>
          <span className="text-xs text-muted-foreground">• Your cozy companion</span>
        </div>
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4">
          <LockedWidget size="large">
            <LargeWidget />
          </LockedWidget>
        </div>
      </div>

      {/* Instructions / CTA with warm messaging */}
      {isPremium ? (
        <div className="bg-primary/10 rounded-xl p-4 text-center">
          <p className="text-sm text-foreground font-medium">
            Add widgets to keep your companion nearby
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Long press your home screen → Add Widget → Cozy Habits
          </p>
        </div>
      ) : (
        <div className="bg-muted rounded-xl p-4 text-center">
          <p className="text-sm text-foreground font-medium mb-1">
            Premium Cozy Experience
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Keep your habits and cat gently present on your home screen
          </p>
          <Button onClick={() => navigate('/premium')} className="w-full">
            Explore Premium
          </Button>
        </div>
      )}
    </div>
  );
};
