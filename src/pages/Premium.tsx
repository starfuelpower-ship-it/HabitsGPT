import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, ArrowLeft, Sparkles, BarChart3, Palette, Users, Infinity, BookOpen, RotateCcw } from 'lucide-react';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppleIAP } from '@/hooks/useAppleIAP';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// PREMIUM FEATURES
// ============================================

const PREMIUM_FEATURES = [
  { icon: Sparkles, label: 'Gentle reflections', description: 'Kind AI-powered journal insights' },
  { icon: Infinity, label: 'Unlimited habits', description: 'Track as many habits as you want' },
  { icon: Palette, label: 'Custom themes', description: 'Personalize your app experience' },
  { icon: Users, label: 'Group habits', description: 'Share progress with friends' },
  { icon: BarChart3, label: 'Full statistics', description: 'Complete history and insights' },
  { icon: BookOpen, label: 'Widgets & extras', description: 'Home screen widgets and more' },
];

// ============================================
// PRICING PLANS
// ============================================
// Prices are fetched from App Store via IAP

const PRICING_PLANS = [
  {
    id: 'monthly' as const,
    name: 'Monthly',
    price: '$7.99',
    period: '/month',
    description: 'Billed monthly',
    popular: false,
  },
  {
    id: 'annual' as const,
    name: 'Annual',
    price: '$39.99',
    period: '/year',
    description: 'Save 58% • 3-day free trial',
    popular: true,
  },
  {
    id: 'lifetime' as const,
    name: 'Lifetime',
    price: '$99.99',
    period: 'one-time',
    description: 'Pay once, own forever',
    popular: false,
  },
];

export default function Premium() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { purchaseSubscription, restorePurchases, isLoading, isNativePlatform } = useAppleIAP();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      navigate('/auth');
      return;
    }

    const success = await purchaseSubscription(selectedPlan);
    if (success) {
      navigate('/');
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  if (isPremium) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
            <Crown className="w-12 h-12 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Unlock Pro</h1>
            <p className="text-muted-foreground mt-2 text-base px-4">
              Unlock deeper customization, gentle reflections, and cozy rewards.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {PREMIUM_FEATURES.map((feature, index) => (
            <div
              key={feature.label}
              className={cn(
                'ios-card p-4 flex items-center gap-4 animate-slide-up',
                `stagger-${Math.min(index + 1, 5)}`
              )}
              style={{ opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{feature.label}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="space-y-3">
          {PRICING_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'w-full ios-card p-4 text-left transition-all relative overflow-hidden',
                selectedPlan === plan.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-xl">
                  BEST VALUE
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className={cn(selectedPlan === plan.id && 'pl-8')}>
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              {selectedPlan === plan.id && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/30"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Continue
              </>
            )}
          </Button>
          
          {/* Legal text */}
          <p className="text-xs text-center text-muted-foreground px-4">
            {isNativePlatform ? (
              <>
                Payment will be charged to your account at confirmation of purchase.
                Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
              </>
            ) : (
              'Premium features available in the mobile app.'
            )}
          </p>
          
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate('/terms')} className="hover:text-foreground">Terms of Service</button>
            <span>•</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground">Privacy Policy</button>
            <span>•</span>
            <button 
              onClick={handleRestore}
              disabled={isLoading}
              className="hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restore Purchase
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
