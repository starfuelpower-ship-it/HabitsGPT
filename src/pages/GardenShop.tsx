import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/contexts/PointsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ArrowLeft, Coins, Leaf, Sparkles, Check, Lock, Flower2, TreeDeciduous } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Seed {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  is_starter: boolean;
  is_premium: boolean;
  rarity: string;
  growth_style: string;
}

interface Decoration {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  price: number;
  is_premium: boolean;
  rarity: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  uncommon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rare: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  legendary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const GardenShop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = usePoints();
  const { isPremium } = usePremium();
  const { playSound, triggerHaptic } = useSoundEffects();
  
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [ownedSeeds, setOwnedSeeds] = useState<Set<string>>(new Set());
  const [ownedDecorations, setOwnedDecorations] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'seeds' | 'decorations'>('seeds');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch seeds
      const { data: seedsData } = await supabase
        .from('plant_seeds')
        .select('*')
        .order('sort_order');

      if (seedsData) setSeeds(seedsData);

      // Fetch decorations
      const { data: decorationsData } = await supabase
        .from('plant_decorations')
        .select('*')
        .order('sort_order');

      if (decorationsData) setDecorations(decorationsData);

      // Fetch owned seeds
      if (user) {
        const { data: ownedSeedsData } = await supabase
          .from('user_seeds')
          .select('seed_id')
          .eq('user_id', user.id);

        if (ownedSeedsData) {
          setOwnedSeeds(new Set(ownedSeedsData.map(s => s.seed_id)));
        }

        // Fetch owned decorations
        const { data: ownedDecorationsData } = await supabase
          .from('user_decorations')
          .select('decoration_id')
          .eq('user_id', user.id);

        if (ownedDecorationsData) {
          setOwnedDecorations(new Set(ownedDecorationsData.map(d => d.decoration_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching garden shop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseSeed = async (seed: Seed) => {
    if (!user) return;

    // Client-side checks for UX
    if (seed.is_premium && !isPremium) {
      toast.error('This seed requires Premium!');
      navigate('/premium');
      return;
    }

    if (balance < seed.price) {
      toast.error('Not enough coins!');
      return;
    }

    setPurchasing(seed.id);
    playSound('click');
    triggerHaptic('light');

    try {
      const { data, error } = await supabase.rpc('purchase_seed', {
        _seed_id: seed.id,
      });

      if (error) {
        console.error('Purchase error:', error);
        toast.error('Purchase failed. Please try again.');
        return;
      }

      const result = data as { success: boolean; error?: string; seed_name?: string } | null;

      if (result?.success) {
        setOwnedSeeds(prev => new Set([...prev, seed.id]));
        toast.success(`You collected ${seed.name}!`, { icon: '🌱' });
        playSound('achievement');
        triggerHaptic('success');
      } else {
        toast.error(result?.error || 'Purchase failed');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseDecoration = async (decoration: Decoration) => {
    if (!user) return;

    if (decoration.is_premium && !isPremium) {
      toast.error('This decoration requires Premium!');
      navigate('/premium');
      return;
    }

    if (balance < decoration.price) {
      toast.error('Not enough coins!');
      return;
    }

    setPurchasing(decoration.id);
    playSound('click');
    triggerHaptic('light');

    try {
      const { data, error } = await supabase.rpc('purchase_decoration', {
        _decoration_id: decoration.id,
      });

      if (error) {
        console.error('Purchase error:', error);
        toast.error('Purchase failed. Please try again.');
        return;
      }

      const result = data as { success: boolean; error?: string; decoration_name?: string } | null;

      if (result?.success) {
        setOwnedDecorations(prev => new Set([...prev, decoration.id]));
        toast.success(`You collected ${decoration.name}!`, { icon: '✨' });
        playSound('achievement');
        triggerHaptic('success');
      } else {
        toast.error(result?.error || 'Purchase failed');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const decorationCategories = ['all', 'pot', 'charm', 'stone', 'lantern', 'furniture'];
  const filteredDecorations = selectedCategory === 'all'
    ? decorations
    : decorations.filter(d => d.category === selectedCategory);

  // Separate starter seeds from purchasable seeds
  const starterSeeds = seeds.filter(s => s.is_starter);
  const purchasableSeeds = seeds.filter(s => !s.is_starter);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              playSound('click');
              navigate(-1);
            }}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Garden Shop</h1>
            <p className="text-sm text-muted-foreground">Seeds, pots, and cozy decorations</p>
          </div>
          <button
            onClick={() => navigate('/points-shop')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-700 dark:text-amber-300">{balance}</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('seeds');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all',
              activeTab === 'seeds'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Leaf className="w-4 h-4" />
            Seeds
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('decorations');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all',
              activeTab === 'decorations'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Decorations
          </button>
        </div>

        {/* Seeds Tab */}
        {activeTab === 'seeds' && (
          <>
            {/* Starter Seeds */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TreeDeciduous className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">Starter Seeds</h2>
                <Badge variant="secondary" className="text-[10px]">Free</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {starterSeeds.map(seed => {
                  const owned = ownedSeeds.has(seed.id);
                  return (
                    <div
                      key={seed.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all',
                        owned
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-card border-border hover:border-primary/50'
                      )}
                    >
                      <div className="text-3xl mb-2 text-center">{seed.icon}</div>
                      <h3 className="font-semibold text-sm text-center mb-1">{seed.name}</h3>
                      <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                        {seed.description}
                      </p>
                      {owned ? (
                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Collected</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handlePurchaseSeed(seed)}
                          disabled={purchasing === seed.id}
                        >
                          Collect Free
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Purchasable Seeds */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Flower2 className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-semibold">Rare Seeds</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {purchasableSeeds.map(seed => {
                  const owned = ownedSeeds.has(seed.id);
                  const canAfford = balance >= seed.price;
                  return (
                    <div
                      key={seed.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all',
                        owned
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-card border-border hover:border-primary/50'
                      )}
                    >
                      <Badge className={cn('mb-2 text-[10px]', RARITY_COLORS[seed.rarity])}>
                        {seed.rarity}
                      </Badge>
                      <div className="text-3xl mb-2 text-center">{seed.icon}</div>
                      <h3 className="font-semibold text-sm text-center mb-1">{seed.name}</h3>
                      <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                        {seed.description}
                      </p>
                      {owned ? (
                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Collected</span>
                        </div>
                      ) : seed.is_premium && !isPremium ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/premium')}
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Premium
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={!canAfford || purchasing === seed.id}
                          onClick={() => handlePurchaseSeed(seed)}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          {seed.price}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Decorations Tab */}
        {activeTab === 'decorations' && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
              {decorationCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('click');
                    setSelectedCategory(cat);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}
                >
                  {cat === 'all' ? 'All' : cat + 's'}
                </button>
              ))}
            </div>

            {/* Decorations Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredDecorations.map(decoration => {
                const owned = ownedDecorations.has(decoration.id);
                const canAfford = balance >= decoration.price;
                return (
                  <div
                    key={decoration.id}
                    className={cn(
                      'p-4 rounded-2xl border transition-all',
                      owned
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-card border-border hover:border-primary/50'
                    )}
                  >
                    <Badge className={cn('mb-2 text-[10px]', RARITY_COLORS[decoration.rarity])}>
                      {decoration.rarity}
                    </Badge>
                    <div className="text-3xl mb-2 text-center">{decoration.icon}</div>
                    <h3 className="font-semibold text-sm text-center mb-1">{decoration.name}</h3>
                    <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                      {decoration.description}
                    </p>
                    {owned ? (
                      <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Owned</span>
                      </div>
                    ) : decoration.is_premium && !isPremium ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/premium')}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Premium
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!canAfford || purchasing === decoration.id}
                        onClick={() => handlePurchaseDecoration(decoration)}
                      >
                        <Coins className="w-3 h-3 mr-1" />
                        {decoration.price}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Collection Stats */}
        <div className="mt-8 ios-card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Collection
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600">{ownedSeeds.size}</p>
              <p className="text-xs text-muted-foreground">Seeds</p>
            </div>
            <div className="flex-1 text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <p className="text-2xl font-bold text-purple-600">{ownedDecorations.size}</p>
              <p className="text-xs text-muted-foreground">Decorations</p>
            </div>
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default GardenShop;
