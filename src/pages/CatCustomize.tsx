import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompanion } from '@/contexts/CompanionContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ArrowLeft, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatCostume, COSTUME_DATA, getCostumeTypeFromDB, ALL_COSTUME_TYPES, type CostumeType } from '@/components/CatCostume';

const CatCustomize = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { equippedCostume, setEquippedCostume } = useCompanion();
  const { playSound, triggerHaptic } = useSoundEffects();
  const [ownedCostumes, setOwnedCostumes] = useState<CostumeType[]>(['none']);
  const [isLoading, setIsLoading] = useState(true);
  const [catAnimation, setCatAnimation] = useState<'idle' | 'happy' | 'stretch' | 'sleep'>('idle');

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOwnedCostumes();
  }, [user]);

  // Cycle cat animations for preview
  useEffect(() => {
    const animations: ('idle' | 'happy' | 'stretch' | 'sleep')[] = ['idle', 'happy', 'stretch', 'sleep'];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % animations.length;
      setCatAnimation(animations[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchOwnedCostumes = async () => {
    if (!user) return;

    try {
      const { data: ownedData } = await supabase
        .from('user_costumes')
        .select('costume_id, cat_costumes(name)')
        .eq('user_id', user.id);

      if (ownedData) {
        const owned: CostumeType[] = ['none'];
        ownedData.forEach((item: any) => {
          if (item.cat_costumes?.name) {
            const costumeType = getCostumeTypeFromDB(item.cat_costumes.name);
            if (costumeType !== 'none') {
              owned.push(costumeType);
            }
          }
        });
        setOwnedCostumes(owned);
      }
    } catch (error) {
      console.error('Error fetching owned costumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEquip = async (costume: CostumeType) => {
    playSound('click');
    triggerHaptic('light');

    await setEquippedCostume(costume);
    
    if (costume !== 'none') {
      toast.success(`Equipped ${COSTUME_DATA[costume].name}!`, { icon: '✨' });
    } else {
      toast.success('Costume removed');
    }
    
    playSound('success');
    setCatAnimation('happy');
  };

  // All available costumes for display (none + all costume types)
  const allCostumes: CostumeType[] = ['none', ...ALL_COSTUME_TYPES];

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
            <h1 className="text-2xl font-bold text-foreground">My Cat</h1>
            <p className="text-sm text-muted-foreground">Customize your companion</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rewards')}
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            Costumes
          </Button>
        </header>

        {/* Cat Preview - Large */}
        <div className="ios-card p-6 mb-6 flex flex-col items-center">
          <div className="relative mb-4">
            <CatPreview 
              costume={equippedCostume} 
              isDark={isDark} 
              animation={catAnimation}
              size="large"
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {equippedCostume !== 'none' ? COSTUME_DATA[equippedCostume].name : 'No costume equipped'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {equippedCostume !== 'none' ? COSTUME_DATA[equippedCostume].description : 'Just your adorable cat'}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              {catAnimation === 'sleep' ? 'Sleeping...' : catAnimation === 'stretch' ? 'Stretching!' : catAnimation === 'happy' ? 'Happy!' : 'Chilling...'}
            </div>
          </div>
        </div>

        {/* Costume Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Your Costumes</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {allCostumes.map((costume) => {
              const isOwned = ownedCostumes.includes(costume);
              const isEquipped = equippedCostume === costume;
              
              return (
                <button
                  key={costume}
                  onClick={() => isOwned && handleEquip(costume)}
                  disabled={!isOwned}
                  className={cn(
                    'relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3',
                    isEquipped
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                      : isOwned
                      ? 'bg-card border-border hover:border-primary/50 active:scale-95'
                      : 'bg-muted/30 border-border/50 opacity-60'
                  )}
                >
                  {/* Cat preview with costume */}
                  <div className="w-16 h-16">
                    <CatPreview 
                      costume={costume} 
                      isDark={isDark}
                      size="small"
                    />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm font-medium block">
                      {COSTUME_DATA[costume].name}
                    </span>
                    {!isOwned && (
                      <span className="text-xs text-muted-foreground">🔒 Not owned</span>
                    )}
                  </div>
                  
                  {isEquipped && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint to get more costumes */}
          {ownedCostumes.length < allCostumes.length && (
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Want more costumes? Earn points by completing habits!
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/rewards')}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Visit Store
              </Button>
            </div>
          )}
        </section>
      </div>

      <BottomTabBar />
    </div>
  );
};

// Cat Preview Component with costume
interface CatPreviewProps {
  costume: CostumeType;
  isDark: boolean;
  animation?: 'idle' | 'happy' | 'stretch' | 'sleep';
  size?: 'small' | 'large';
}

const CatPreview = ({ costume, isDark, animation = 'idle', size = 'small' }: CatPreviewProps) => {
  const sizeClass = size === 'large' ? 'w-32 h-32' : 'w-full h-full';
  
  return (
    <svg
      viewBox="0 0 64 64"
      className={sizeClass}
      style={{
        filter: isDark ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
      }}
    >
      <g className={cn(
        'origin-center transition-transform duration-500',
        animation === 'stretch' && 'scale-x-110 scale-y-90',
        animation === 'sleep' && 'translate-y-2'
      )}>
        {/* Body */}
        <ellipse
          cx="32"
          cy="42"
          rx="14"
          ry="10"
          className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
        />
        
        {/* Head */}
        <circle
          cx="32"
          cy="28"
          r="12"
          className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
        />
        
        {/* Ears */}
        <polygon
          points="22,20 26,28 18,28"
          className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
        />
        <polygon points="23,22 25,26 20,26" className={isDark ? 'fill-gray-500' : 'fill-pink-200'} />
        <polygon
          points="42,20 46,28 38,28"
          className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
        />
        <polygon points="41,22 44,26 39,26" className={isDark ? 'fill-gray-500' : 'fill-pink-200'} />
        
        {/* Eyes */}
        {animation === 'sleep' ? (
          <g>
            <path d="M24 26 Q27 28 30 26" stroke={isDark ? '#374151' : '#1f2937'} strokeWidth="1.5" fill="none" />
            <path d="M34 26 Q37 28 40 26" stroke={isDark ? '#374151' : '#1f2937'} strokeWidth="1.5" fill="none" />
          </g>
        ) : (
          <g>
            <ellipse cx="27" cy="26" rx="2.5" ry={animation === 'happy' ? '1' : '3'} className="fill-gray-800" />
            <ellipse cx="37" cy="26" rx="2.5" ry={animation === 'happy' ? '1' : '3'} className="fill-gray-800" />
            {animation !== 'happy' && (
              <>
                <circle cx="26" cy="25" r="1" className="fill-white opacity-80" />
                <circle cx="36" cy="25" r="1" className="fill-white opacity-80" />
              </>
            )}
          </g>
        )}
        
        {/* Nose */}
        <ellipse cx="32" cy="31" rx="1.5" ry="1" className="fill-pink-400" />
        
        {/* Mouth */}
        <path
          d="M30 33 Q32 35 34 33"
          stroke={isDark ? '#374151' : '#92400e'}
          strokeWidth="1"
          fill="none"
        />
        
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
        <path
          d="M46 42 Q56 38 54 30"
          stroke={isDark ? '#9ca3af' : '#fbbf24'}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Costume overlay */}
        <CatCostume costume={costume} isDark={isDark} />
      </g>
    </svg>
  );
};

export default CatCustomize;
