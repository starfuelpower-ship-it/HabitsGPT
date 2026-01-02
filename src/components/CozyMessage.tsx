import { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CozyMessageProps {
  message: string;
  onDismiss: () => void;
  icon?: string;
  showHeart?: boolean;
}

export function CozyMessage({ message, onDismiss, icon, showHeart = true }: CozyMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Fade in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] transition-all duration-300',
        isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
    >
      <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          {/* Icon or heart */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon ? (
              <span className="text-xl">{icon}</span>
            ) : showHeart ? (
              <Heart className="w-5 h-5 text-primary fill-primary/30" />
            ) : (
              <span className="text-xl">🌿</span>
            )}
          </div>
          
          {/* Message */}
          <div className="flex-1 pt-1">
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Contextual gentle messages based on user state
export const CONTEXTUAL_MESSAGES = {
  // After completing all habits
  all_complete: [
    "Perfect day. You did it. 🌸",
    "All done! Time to rest now. ✨",
    "You showed up today. That's everything. 💫",
  ],
  
  // Consistency messages (used sparingly)
  consistency: [
    "This is becoming part of who you are. 🌿",
    "Quiet consistency. That's real strength. 💪",
    "Day by day, you're growing. 🌱",
  ],
  
  // Late night
  late_night: [
    "It's okay to rest. Tomorrow is a new day. 🌙",
    "Even checking in counts. Sleep well. ✨",
  ],
  
  // Streak milestones (gentle)
  streak_3: "Three days! A lovely pattern forming. 🌷",
  streak_7: "A whole week. You should be proud. 🌸",
  streak_14: "Two weeks of showing up. That's special. 💫",
  streak_30: "One month of care. You're incredible. 🌳",
  
  // After a break
  after_break: [
    "Starting fresh. No guilt, just growth. 🌱",
    "Every return is a victory. Welcome back. 💝",
  ],
};

export function getContextualMessage(context: {
  completedAll?: boolean;
  streak?: number;
  isAfterBreak?: boolean;
  isLateNight?: boolean;
  daysActive?: number;
}): string | null {
  // Only show messages occasionally (30% chance)
  if (Math.random() > 0.3) return null;

  if (context.completedAll) {
    const messages = CONTEXTUAL_MESSAGES.all_complete;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (context.streak === 3) return CONTEXTUAL_MESSAGES.streak_3;
  if (context.streak === 7) return CONTEXTUAL_MESSAGES.streak_7;
  if (context.streak === 14) return CONTEXTUAL_MESSAGES.streak_14;
  if (context.streak === 30) return CONTEXTUAL_MESSAGES.streak_30;

  if (context.isAfterBreak) {
    const messages = CONTEXTUAL_MESSAGES.after_break;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (context.isLateNight) {
    const messages = CONTEXTUAL_MESSAGES.late_night;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (context.daysActive && context.daysActive % 7 === 0 && context.daysActive > 0) {
    const messages = CONTEXTUAL_MESSAGES.consistency;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  return null;
}
