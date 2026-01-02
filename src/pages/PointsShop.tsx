import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/contexts/PointsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useAppleIAP } from '@/hooks/useAppleIAP';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ArrowLeft, Coins, Crown, Sparkles, Gift, Zap, Star, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Point bundle definitions
// Prices are fetched from App Store via IAP
const POINT_BUNDLES = [
  {
    id: 'small',
    name: 'Starter Pack',
    points: 500,
    price: '$0.99',
    icon: Package,
    color: 'from-blue-400 to-blue-600',
    popular: false,
  },
  {
    id: 'medium',
    name: 'Value Bundle',
    points: 1500,
    price: '$2.49',
    icon: Gift,
    color: 'from-purple-400 to-purple-600',
    popular: true,
    bonus: '+150 bonus',
  },
  {
    id: 'large',
    name: 'Super Pack',
    points: 5000,
    price: '$6.99',
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    popular: false,
    bonus: '+750 bonus',
  },
  {
    id: 'mega',
    name: 'Mega Bundle',
    points: 12000,
    price: '$14.99',
    icon: Star,
    color: 'from-pink-400 to-rose-500',
    popular: false,
    bonus: '+2000 bonus',
  },
];

const PointsShop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = usePoints();
  const { isPremium } = usePremium();
  const { purchasePointBundle, isLoading: iapLoading, isNativePlatform } = useAppleIAP();
  const { playSound, triggerHaptic } = useSoundEffects();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (bundle: typeof POINT_BUNDLES[0]) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setPurchasing(bundle.id);
    playSound('click');
    triggerHaptic('light');

    const success = await purchasePointBundle(bundle.id);
    
    if (success) {
      playSound('achievement');
      triggerHaptic('success');
    }

    setPurchasing(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Get Points</h1>
            <p className="text-sm text-muted-foreground">Support your cozy journey</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-700 dark:text-amber-300">{balance.toLocaleString()}</span>
          </div>
        </header>

        {/* Premium Bonus Banner */}
        {isPremium && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-700/50">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800 dark:text-amber-200">Premium Bonus Active</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              You get 20% extra points on all purchases!
            </p>
          </div>
        )}

        {/* Point Bundles */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Point Bundles</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Unlock costumes faster while still earning points naturally.
          </p>

          <div className="space-y-3">
            {POINT_BUNDLES.map((bundle) => {
              const Icon = bundle.icon;
              const isProcessing = purchasing === bundle.id || iapLoading;

              return (
                <div
                  key={bundle.id}
                  className={cn(
                    'relative p-4 rounded-2xl border transition-all',
                    bundle.popular
                      ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 ring-2 ring-primary/20'
                      : 'bg-card border-border hover:border-primary/50'
                  )}
                >
                  {bundle.popular && (
                    <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br',
                      bundle.color
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{bundle.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {bundle.points.toLocaleString()}
                        </span>
                        <Coins className="w-4 h-4 text-amber-500" />
                        {bundle.bonus && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {bundle.bonus}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price Button */}
                    <Button
                      onClick={() => handlePurchase(bundle)}
                      disabled={isProcessing}
                      className={cn(
                        'min-w-[80px]',
                        bundle.popular && 'bg-primary hover:bg-primary/90'
                      )}
                    >
                      {isProcessing && purchasing === bundle.id ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        bundle.price
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Earn Points Info */}
        <section className="ios-card p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Earn Points for Free
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Complete habits and maintain streaks to earn points without spending!
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complete a habit</span>
              <span className="font-medium text-green-600">+10 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">All habits done</span>
              <span className="font-medium text-green-600">+25 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">7-day streak</span>
              <span className="font-medium text-green-600">+30 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">30-day streak</span>
              <span className="font-medium text-green-600">+100 pts</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/')}
          >
            Start Completing Habits
          </Button>
        </section>

        {/* IAP Notice */}
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl">
          {isNativePlatform ? (
            <p>
              Payment will be charged to your account.
              All purchases are processed securely.
            </p>
          ) : (
            <p>
              Point bundles available in the mobile app. Coming soon to more platforms.
            </p>
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default PointsShop;
