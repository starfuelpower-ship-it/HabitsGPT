import { useState } from 'react';
import { CloudHabit } from '@/hooks/useCloudHabits';
import { Check, Flame, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CelebrationAnimation } from './CelebrationAnimation';
import { getHabitIcon } from './HabitIconPicker';
import { useCompanion } from '@/contexts/CompanionContext';
import { usePoints, POINTS } from '@/contexts/PointsContext';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/hooks/useSoundEffects';

interface CloudHabitCardProps {
  habit: CloudHabit;
  onToggle: (id: string) => void;
  onEdit: (habit: CloudHabit) => void;
  onShare?: (habit: CloudHabit) => void;
  index: number;
  confettiEnabled?: boolean;
  soundEnabled?: boolean;
  onComplete?: () => void;
}

// Completion sound
const playCompletionSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {}
};

// Mini progress ring component
function MiniProgressRing({ progress, size = 32, color }: { progress: number; size?: number; color: string }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}

export function CloudHabitCard({ 
  habit, 
  onToggle, 
  onEdit,
  onShare,
  index,
  confettiEnabled = true,
  soundEnabled = true,
  onComplete,
}: CloudHabitCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { triggerReaction } = useCompanion();
  const { earnPoints } = usePoints();
  const { user } = useAuth();
  
  const HabitIcon = getHabitIcon(habit.icon || 'check-circle');
  const habitColor = habit.color || 'hsl(var(--primary))';
  
  // Calculate a "weekly progress" - simplified as streak % 7
  const weeklyProgress = habit.completed_today ? Math.min(100, ((habit.streak % 7) + 1) * (100 / 7)) : (habit.streak % 7) * (100 / 7);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const wasCompleted = habit.completed_today;
    const newStreak = wasCompleted ? habit.streak - 1 : habit.streak + 1;
    
    if (!wasCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
      
      if (soundEnabled) playCompletionSound();
      
      // Trigger haptic feedback
      triggerHaptic('medium');
      
      if (confettiEnabled) {
        setCelebrationStreak(newStreak);
        setShowCelebration(true);
      }
      
      // Trigger cat companion reaction
      triggerReaction('habit_complete');
      
      // Earn points for completing habit (logged-in users only)
      if (user) {
        earnPoints(POINTS.HABIT_COMPLETE, 'habit_complete', `Completed ${habit.name}`);
        
        // Streak bonus points
        if (newStreak === 3) {
          earnPoints(POINTS.STREAK_BONUS_3, 'streak_bonus', '3-day streak bonus!');
        } else if (newStreak === 7) {
          earnPoints(POINTS.STREAK_BONUS_7, 'streak_bonus', '7-day streak bonus!');
        } else if (newStreak === 14) {
          earnPoints(POINTS.STREAK_BONUS_14, 'streak_bonus', '14-day streak bonus!');
        } else if (newStreak === 30) {
          earnPoints(POINTS.STREAK_BONUS_30, 'streak_bonus', '30-day streak bonus!');
        }
      }
      
      // Notify parent of completion
      onComplete?.();
    }
    
    onToggle(habit.id);
  };

  const isMilestone = [7, 14, 30, 60, 100, 365].includes(celebrationStreak);

  return (
    <div
      className={cn(
        'group relative overflow-hidden cursor-pointer',
        'bg-card rounded-2xl p-4',
        'border border-border/50',
        'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]',
        'hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]',
        'transition-all duration-300 ease-out',
        isAnimating && 'scale-[1.02]',
        habit.completed_today && 'bg-accent/40 border-primary/20'
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        borderColor: habit.color ? `${habit.color}30` : undefined,
      }}
      onClick={() => onEdit(habit)}
    >
      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          type={isMilestone ? 'milestone' : 'daily'}
          streak={celebrationStreak}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      {/* Completion shimmer effect */}
      {isAnimating && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />
      )}
      
      <div className="flex items-center gap-4">
        {/* Left: Icon with progress ring */}
        <div className="relative flex-shrink-0">
          <div 
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
              habit.completed_today ? 'scale-95' : 'scale-100'
            )}
            style={{ 
              backgroundColor: `${habitColor}15`,
            }}
          >
            <HabitIcon 
              className={cn(
                'w-6 h-6 transition-all duration-300',
                habit.completed_today && 'opacity-60'
              )}
              style={{ color: habitColor }}
            />
          </div>
          
          {/* Mini progress ring overlay */}
          <div className="absolute -bottom-1 -right-1">
            <div className="bg-card rounded-full p-0.5 shadow-sm">
              <MiniProgressRing 
                progress={weeklyProgress} 
                size={20} 
                color={habitColor}
              />
            </div>
          </div>
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold text-foreground transition-all duration-300 truncate',
              habit.completed_today && 'line-through text-muted-foreground'
            )}
          >
            {habit.name}
          </h3>
          
          {habit.notes ? (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {habit.notes}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              {habit.category}
            </p>
          )}
        </div>

        {/* Right: Streak + Checkbox */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Share button for streaks >= 3 */}
          {habit.streak >= 3 && onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(habit);
              }}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                'bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary',
                'opacity-0 group-hover:opacity-100'
              )}
              aria-label="Share milestone"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Streak badge */}
          {habit.streak > 0 && (
            <div 
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300',
                habit.streak >= 7 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
              style={habit.streak >= 7 && habit.color ? {
                backgroundColor: `${habit.color}15`,
                color: habit.color,
              } : undefined}
            >
              <Flame 
                className={cn(
                  'w-3 h-3',
                  habit.streak >= 7 && 'animate-pulse'
                )} 
              />
              <span>{habit.streak}</span>
            </div>
          )}

          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
              'hover:scale-110 active:scale-95',
              habit.completed_today
                ? 'border-transparent shadow-md'
                : 'border-muted-foreground/30 hover:border-primary/50 bg-transparent'
            )}
            style={habit.completed_today ? {
              backgroundColor: habitColor,
              boxShadow: `0 4px 12px -2px ${habitColor}40`,
            } : undefined}
            aria-label={habit.completed_today ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check 
              className={cn(
                'w-4 h-4 transition-all duration-300',
                habit.completed_today 
                  ? 'text-white scale-100 opacity-100' 
                  : 'scale-0 opacity-0'
              )}
              strokeWidth={3}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
