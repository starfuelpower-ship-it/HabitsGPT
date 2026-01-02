import { useState } from 'react';
import { Habit } from '@/types/habit';
import { Check, Flame, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CelebrationAnimation } from './CelebrationAnimation';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
  confettiEnabled?: boolean;
  soundEnabled?: boolean;
}

const categoryClass: Record<string, string> = {
  Health: 'category-health',
  Productivity: 'category-productivity',
  Fitness: 'category-fitness',
  Mindset: 'category-mindset',
  Custom: 'category-custom',
};

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
  } catch (e) {
    // Audio context might not be available
  }
};

export function HabitCard({ 
  habit, 
  onToggle, 
  onDelete, 
  index,
  confettiEnabled = true,
  soundEnabled = true,
}: HabitCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [showRipple, setShowRipple] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const wasCompleted = habit.completedToday;
    const newStreak = wasCompleted ? habit.streak - 1 : habit.streak + 1;
    
    if (!wasCompleted) {
      // Show ripple effect
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
      
      // Play sound if enabled
      if (soundEnabled) {
        playCompletionSound();
      }
      
      // Show confetti if enabled
      if (confettiEnabled) {
        setCelebrationStreak(newStreak);
        setShowCelebration(true);
      }
    }
    
    onToggle(habit.id);
  };

  const isMilestone = [7, 14, 30, 60, 100, 365].includes(celebrationStreak);

  return (
    <div
      className={cn(
        'habit-card group relative overflow-hidden',
        habit.completedToday && 'completed'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          type={isMilestone ? 'milestone' : 'daily'}
          streak={celebrationStreak}
          onComplete={() => setShowCelebration(false)}
        />
      )}
      
      <div className="flex items-start gap-3">
        {/* Checkbox with ripple */}
        <div className="relative">
          <button
            onClick={handleToggle}
            className={cn(
              'mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300',
              habit.completedToday
                ? 'bg-primary border-primary animate-check-bounce'
                : 'border-muted-foreground/30 hover:border-primary/50 hover:scale-110'
            )}
            aria-label={habit.completedToday ? 'Mark incomplete' : 'Mark complete'}
          >
            {habit.completedToday && (
              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            )}
          </button>
          
          {/* Ripple effect */}
          {showRipple && (
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ripple" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'font-medium text-foreground transition-all duration-300',
                habit.completedToday && 'line-through text-muted-foreground'
              )}
            >
              {habit.name}
            </h3>
            <span className={cn('category-badge', categoryClass[habit.category])}>
              {habit.category}
            </span>
          </div>

          {habit.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {habit.notes}
            </p>
          )}

          {/* Streak */}
          {habit.streak > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Flame
                className={cn(
                  'w-4 h-4 text-category-fitness transition-all duration-300',
                  habit.streak >= 30 && 'animate-streak-pulse text-destructive',
                  habit.streak >= 7 && habit.streak < 30 && 'animate-streak-pulse'
                )}
              />
              <span className={cn(
                'text-muted-foreground transition-all duration-300',
                habit.streak >= 7 && 'font-medium',
                habit.streak >= 30 && 'text-primary font-semibold'
              )}>
                {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
                {habit.streak >= 30 && ' 🔥'}
                {habit.streak >= 7 && habit.streak < 30 && ' ⭐'}
              </span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
          aria-label="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
