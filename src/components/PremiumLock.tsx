import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ============================================
// PREMIUM LOCK
// ============================================
// Overlay for locked premium features
// Customize: Change the blur amount, text, or styling

interface PremiumLockProps {
  children: React.ReactNode;
  feature?: string;
  className?: string;
}

export function PremiumLock({ children, feature, className }: PremiumLockProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('relative', className)}>
      {/* Blurred content */}
      <div className="premium-blur select-none">{children}</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <div className="flex items-center gap-1.5 mb-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Premium Feature</span>
        </div>
        
        {feature && (
          <p className="text-sm text-muted-foreground text-center px-4 mb-4">
            {feature}
          </p>
        )}
        
        <Button
          size="sm"
          onClick={() => navigate('/premium')}
          className="gap-2"
        >
          <Crown className="w-4 h-4" />
          Unlock with Premium
        </Button>
      </div>
    </div>
  );
}
