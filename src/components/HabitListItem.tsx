import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { CelebrationAnimation } from './CelebrationAnimation';

// ============================================
// HABIT LIST ITEM
// ============================================
// Individual habit card with completion toggle
// Customize: Modify the card design, animations, or add more info

interface HabitListItemProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onClick: () => void;
  confettiEnabled?: boolean;
  soundEnabled?: boolean;
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
  } catch (e) {
    // Audio context might not be available
  }
};

export function HabitListItem({
  habit,
  completed,
  streak,
  onToggle,
  onClick,
  confettiEnabled = true,
  soundEnabled = true,
}: HabitListItemProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  
  const categoryConfig = OLD_CATEGORY_CONFIG[habit.category];
  const categoryColor = categoryConfig?.color || OLD_CATEGORY_CONFIG.Custom.color;
  const icon = habit.icon || categoryConfig?.icon || '✅';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!completed) {
      setIsAnimating(true);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
      
      const newStreak = streak + 1;
      
      if (confettiEnabled) {
        setCelebrationStreak(newStreak);
        setShowCelebration(true);
      }
      
      if (soundEnabled) {
        playCompletionSound();
      }
      
      setTimeout(() => setIsAnimating(false), 300);
    }
    
    onToggle();
  };

  const isMilestone = [7, 14, 30, 60, 100, 365].includes(celebrationStreak);

  return (
    <div
      onClick={onClick}
      className={cn(
        'ios-card p-4 cursor-pointer transition-all duration-200 hover:shadow-elevated relative overflow-hidden',
        completed && 'opacity-75'
      )}
    >
      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          type={isMilestone ? 'milestone' : 'daily'}
          streak={celebrationStreak}
          onComplete={() => setShowCelebration(false)}
        />
      )}
      
      <div className="flex items-center gap-4">
        {/* Completion checkbox */}
        <div className="relative">
          <button
            onClick={handleToggle}
            className={cn(
              'habit-checkbox',
              completed && 'checked',
              isAnimating && 'animate-check-bounce'
            )}
            style={{
              borderColor: completed ? categoryColor : undefined,
              backgroundColor: completed ? categoryColor : undefined,
            }}
          >
            {completed && (
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            )}
          </button>
          
          {/* Ripple effect */}
          {showRipple && (
            <div 
              className="absolute inset-0 rounded-full animate-ripple"
              style={{ backgroundColor: `${categoryColor}40` }}
            />
          )}
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold text-foreground truncate',
              completed && 'line-through text-muted-foreground'
            )}
          >
            {habit.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {streak > 0 ? (
              <span className={cn(
                streak > 0 && 'text-primary font-medium',
                streak >= 30 && 'font-semibold'
              )}>
                🔥 {streak} day streak
                {streak >= 30 && ' 🎉'}
                {streak >= 7 && streak < 30 && ' ⭐'}
              </span>
            ) : (
              <span>Start your streak today!</span>
            )}
          </p>
        </div>

        {/* Category badge */}
        <div
          className="px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {habit.category}
        </div>
      </div>
    </div>
  );
}
