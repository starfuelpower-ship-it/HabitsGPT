import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/contexts/PointsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ArrowLeft, Coins, Crown, Sparkles, Check, Lock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatCostume, getCostumeTypeFromDB, type CostumeType } from '@/components/CatCostume';

interface Costume {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  is_premium_only: boolean;
  category: string;
}

// Cat preview with costume for store display
const CatPreviewSmall = ({ costume, isDark }: { costume: CostumeType; isDark: boolean }) => (
  <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
    <g>
      {/* Body */}
      <ellipse cx="32" cy="42" rx="14" ry="10" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
      {/* Head */}
      <circle cx="32" cy="28" r="12" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
      {/* Ears */}
      <polygon points="22,20 26,28 18,28" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
      <polygon points="23,22 25,26 20,26" className={isDark ? 'fill-gray-500' : 'fill-pink-200'} />
      <polygon points="42,20 46,28 38,28" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
      <polygon points="41,22 44,26 39,26" className={isDark ? 'fill-gray-500' : 'fill-pink-200'} />
      {/* Eyes */}
      <ellipse cx="27" cy="26" rx="2.5" ry="3" className="fill-gray-800" />
      <ellipse cx="37" cy="26" rx="2.5" ry="3" className="fill-gray-800" />
      <circle cx="26" cy="25" r="1" className="fill-white opacity-80" />
      <circle cx="36" cy="25" r="1" className="fill-white opacity-80" />
      {/* Nose */}
      <ellipse cx="32" cy="31" rx="1.5" ry="1" className="fill-pink-400" />
      {/* Mouth */}
      <path d="M30 33 Q32 35 34 33" stroke={isDark ? '#374151' : '#92400e'} strokeWidth="1" fill="none" />
      {/* Whiskers */}
      <g className={isDark ? 'stroke-gray-500' : 'stroke-amber-400'} strokeWidth="0.5">
        <line x1="18" y1="30" x2="26" y2="31" />
        <line x1="18" y1="32" x2="26" y2="32" />
        <line x1="46" y1="30" x2="38" y2="31" />
        <line x1="46" y1="32" x2="38" y2="32" />
      </g>
      {/* Paws */}
      <ellipse cx="26" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
      <ellipse cx="38" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
      {/* Tail */}
      <path d="M46 42 Q56 38 54 30" stroke={isDark ? '#9ca3af' : '#fbbf24'} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Costume */}
      <CatCostume costume={costume} isDark={isDark} />
    </g>
  </svg>
);

const Rewards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, spendPoints } = usePoints();
  const { isPremium } = usePremium();
  const { resolvedTheme } = useTheme();
  const { playSound, triggerHaptic } = useSoundEffects();
  const { checkAndAwardAchievements } = useAchievements();
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [ownedCostumes, setOwnedCostumes] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
    // Award achievement for visiting rewards
    checkAndAwardAchievements({ rewardsVisited: true });
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all costumes
      const { data: costumesData } = await supabase
        .from('cat_costumes')
        .select('*')
        .order('sort_order');

      if (costumesData) {
        setCostumes(costumesData);
      }

      // Fetch owned costumes
      if (user) {
        const { data: ownedData } = await supabase
          .from('user_costumes')
          .select('costume_id')
          .eq('user_id', user.id);

        if (ownedData) {
          setOwnedCostumes(new Set(ownedData.map((c) => c.costume_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (costume: Costume) => {
    if (!user) return;

    // Client-side checks for UX only (server validates atomically)
    if (costume.is_premium_only && !isPremium) {
      toast.error('This costume requires Premium!');
      navigate('/premium');
      return;
    }

    if (balance < costume.price) {
      toast.error('Not enough points!');
      return;
    }

    setPurchasing(costume.id);
    playSound('click');
    triggerHaptic('light');

    try {
      // Use secure server-side RPC for atomic purchase
      const { data, error } = await supabase.rpc('purchase_costume', {
        _costume_id: costume.id,
      });

      if (error) {
        console.error('Purchase error:', error);
        toast.error('Purchase failed. Please try again.');
        return;
      }

      const result = data as { success: boolean; error?: string; new_balance?: number; costume_name?: string } | null;

      if (result?.success) {
        setOwnedCostumes((prev) => new Set([...prev, costume.id]));
        toast.success(`You unlocked ${costume.name}!`, { icon: '🎉' });
        playSound('achievement');
        triggerHaptic('success');
        
        // Award achievement for costume purchase
        checkAndAwardAchievements({ 
          costumeEquipped: true, 
          pointsSpent: true,
          itemsUnlocked: ownedCostumes.size + 1,
        });
      } else {
        // Handle specific error messages from server
        const errorMsg = result?.error || 'Purchase failed';
        if (errorMsg === 'Premium required') {
          toast.error('This costume requires Premium!');
          navigate('/premium');
        } else if (errorMsg === 'Insufficient points') {
          toast.error('Not enough points!');
        } else if (errorMsg === 'Already owned') {
          toast.info('You already own this costume!');
          setOwnedCostumes((prev) => new Set([...prev, costume.id]));
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const categories = ['all', 'hat', 'accessory', 'outfit'];
  const filteredCostumes = selectedCategory === 'all'
    ? costumes
    : costumes.filter((c) => c.category === selectedCategory);

  const regularCostumes = filteredCostumes.filter((c) => !c.is_premium_only);
  const premiumCostumes = filteredCostumes.filter((c) => c.is_premium_only);

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
            <h1 className="text-2xl font-bold text-foreground">Cozy Store</h1>
            <p className="text-sm text-muted-foreground">Unlock adorable costumes for your cat!</p>
          </div>
          <button
            onClick={() => navigate('/points-shop')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-700 dark:text-amber-300">{balance}</span>
          </button>
        </header>

        {/* Get More Points Banner */}
        <button
          onClick={() => navigate('/points-shop')}
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-between hover:from-primary/15 hover:to-primary/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Earn more points</p>
              <p className="text-xs text-muted-foreground">Complete habits to unlock costumes</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-primary" />
        </button>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}s
            </button>
          ))}
        </div>

        {/* Regular Costumes */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Available Costumes</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {regularCostumes.map((costume) => {
              const owned = ownedCostumes.has(costume.id);
              const canAfford = balance >= costume.price;
              const costumeType = getCostumeTypeFromDB(costume.name);

              return (
                <div
                  key={costume.id}
                  className={cn(
                    'relative p-4 rounded-2xl border transition-all',
                    owned
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                  )}
                >
                  {/* Cat preview with costume */}
                  <div className="mb-2">
                    <CatPreviewSmall costume={costumeType} isDark={isDark} />
                  </div>
                  <h3 className="font-semibold text-sm text-center mb-1">{costume.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                    {costume.description}
                  </p>

                  {owned ? (
                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Owned</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!canAfford || purchasing === costume.id}
                      onClick={() => handlePurchase(costume)}
                    >
                      <Coins className="w-3 h-3 mr-1" />
                      {costume.price}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Premium Costumes */}
        {premiumCostumes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Premium Exclusive</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Special costumes for Pro members
            </p>
            <div className="grid grid-cols-2 gap-3">
              {premiumCostumes.map((costume) => {
                const owned = ownedCostumes.has(costume.id);
                const canAfford = balance >= costume.price;
                const canPurchase = isPremium && canAfford && !owned;
                const costumeType = getCostumeTypeFromDB(costume.name);

                return (
                  <div
                    key={costume.id}
                    className={cn(
                      'relative p-4 rounded-2xl border transition-all',
                      owned
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-200/50 dark:border-amber-800/50 shadow-[0_0_10px_rgba(251,191,36,0.15)]',
                      !isPremium && 'opacity-80'
                    )}
                  >
                    {/* Gold crown badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                    {/* Cat preview with costume */}
                    <div className="mb-2">
                      <CatPreviewSmall costume={costumeType} isDark={isDark} />
                    </div>
                    <h3 className="font-semibold text-sm text-center mb-1">{costume.name}</h3>
                    <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                      {costume.description}
                    </p>

                    {owned ? (
                      <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Owned</span>
                      </div>
                    ) : !isPremium ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/premium')}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Unlock Premium
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                        disabled={!canAfford || purchasing === costume.id}
                        onClick={() => handlePurchase(costume)}
                      >
                        <Coins className="w-3 h-3 mr-1" />
                        {costume.price}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* How to Earn Points */}
        <section className="ios-card p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            How to Earn Points
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complete a habit</span>
              <span className="font-medium text-green-600">+10 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complete all daily habits</span>
              <span className="font-medium text-green-600">+25 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily check-in</span>
              <span className="font-medium text-green-600">+5 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">7-day streak bonus</span>
              <span className="font-medium text-green-600">+30 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weekly dedication bonus</span>
              <span className="font-medium text-green-600">+50 pts</span>
            </div>
          </div>
        </section>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Rewards;
