import { Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================
// PREMIUM BANNER
// ============================================
// Upgrade prompt banner for free users
// Customize: Change the copy, colors, or design

interface PremiumBannerProps {
  compact?: boolean;
}

export function PremiumBanner({ compact = false }: PremiumBannerProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <button
        onClick={() => navigate('/premium')}
        className="w-full ios-card p-3 flex items-center gap-3 text-left hover:shadow-elevated transition-shadow"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Crown className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">Upgrade to Premium</p>
          <p className="text-xs text-muted-foreground">Unlock all features</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/premium')}
      className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(350 80% 65%) 0%, hsl(20 90% 65%) 100%)',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Upgrade to Premium</h3>
          <p className="text-white/80 text-sm mt-1">
            Unlock unlimited habits and detailed reports.
          </p>
        </div>
        <ArrowRight className="w-6 h-6 text-white/80 mt-4" />
      </div>
    </button>
  );
}
