import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { CostumeType } from '@/components/CatCostume';

export type CompanionType = 'cat' | 'none';

export type CatColor = 'default' | 'orange' | 'gray' | 'cream' | 'brown' | 'black' | 'white' | 'calico';

export type CatPattern = 'none' | 'tabby' | 'spots' | 'tuxedo' | 'siamese' | 'tiger' | 'tortie' | 'bicolor' | 'van' | 'hearts';

export const CAT_COLORS: Record<CatColor, { name: string; body: string; bodyDark: string; innerEar: string }> = {
  default: { name: 'Golden', body: '#fde68a', bodyDark: '#fcd34d', innerEar: '#fbcfe8' },
  orange: { name: 'Orange Tabby', body: '#fb923c', bodyDark: '#ea580c', innerEar: '#fed7aa' },
  gray: { name: 'Gray', body: '#9ca3af', bodyDark: '#6b7280', innerEar: '#e5e7eb' },
  cream: { name: 'Cream', body: '#fef3c7', bodyDark: '#fde68a', innerEar: '#fce7f3' },
  brown: { name: 'Brown', body: '#a78bfa', bodyDark: '#8b5cf6', innerEar: '#e9d5ff' },
  black: { name: 'Black', body: '#374151', bodyDark: '#1f2937', innerEar: '#6b7280' },
  white: { name: 'White', body: '#f9fafb', bodyDark: '#e5e7eb', innerEar: '#fce7f3' },
  calico: { name: 'Calico', body: '#fef3c7', bodyDark: '#fdba74', innerEar: '#fce7f3' },
};

export const CAT_PATTERNS: Record<CatPattern, { name: string; icon: string; description: string }> = {
  none: { name: 'Solid', icon: '⬤', description: 'Clean solid fur' },
  tabby: { name: 'Tabby', icon: '≋', description: 'Classic striped pattern' },
  spots: { name: 'Spotted', icon: '●○', description: 'Cute polka dots' },
  tuxedo: { name: 'Tuxedo', icon: '◐', description: 'Formal white chest' },
  siamese: { name: 'Siamese', icon: '◑', description: 'Dark face & paws' },
  tiger: { name: 'Tiger', icon: '≡', description: 'Bold stripes' },
  tortie: { name: 'Tortoiseshell', icon: '◈', description: 'Mixed patches' },
  bicolor: { name: 'Bicolor', icon: '◧', description: 'Half & half' },
  van: { name: 'Van', icon: '◯', description: 'Color on head & tail' },
  hearts: { name: 'Hearts', icon: '♡', description: 'Adorable heart marks' },
};

interface CompanionContextType {
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
  companionType: CompanionType;
  setCompanionType: (type: CompanionType) => void;
  equippedCostume: CostumeType;
  setEquippedCostume: (costume: CostumeType) => Promise<void>;
  catColor: CatColor;
  setCatColor: (color: CatColor) => void;
  catPattern: CatPattern;
  setCatPattern: (pattern: CatPattern) => void;
  previewPattern: CatPattern | null;
  setPreviewPattern: (pattern: CatPattern | null) => void;
  catSize: number;
  setCatSize: (size: number) => void;
  catSoundsEnabled: boolean;
  setCatSoundsEnabled: (enabled: boolean) => void;
  triggerReaction: (type: 'habit_complete' | 'all_complete') => void;
  currentReaction: 'habit_complete' | 'all_complete' | null;
  isLoading: boolean;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

const COMPANION_SHOW_KEY = 'daily-reset-show-companion';
const COMPANION_TYPE_KEY = 'daily-reset-companion-type';
const EQUIPPED_COSTUME_KEY = 'daily-reset-equipped-costume';
const CAT_COLOR_KEY = 'daily-reset-cat-color';
const CAT_PATTERN_KEY = 'daily-reset-cat-pattern';
const CAT_SIZE_KEY = 'daily-reset-cat-size';
const CAT_SOUNDS_KEY = 'daily-reset-cat-sounds';

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [localShowCompanion, setLocalShowCompanion] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COMPANION_SHOW_KEY);
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  
  const [localCompanionType, setLocalCompanionType] = useState<CompanionType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COMPANION_TYPE_KEY);
      return (stored as CompanionType) || 'cat';
    }
    return 'cat';
  });

  const [equippedCostume, setEquippedCostumeState] = useState<CostumeType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EQUIPPED_COSTUME_KEY);
      return (stored as CostumeType) || 'none';
    }
    return 'none';
  });

  const [catColor, setCatColorState] = useState<CatColor>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAT_COLOR_KEY);
      return (stored as CatColor) || 'default';
    }
    return 'default';
  });

  const [catSize, setCatSizeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAT_SIZE_KEY);
      if (stored) {
        const size = parseFloat(stored);
        if (!isNaN(size) && size >= 0.5 && size <= 2) return size;
      }
    }
    return 1;
  });

  const [catSoundsEnabled, setCatSoundsEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAT_SOUNDS_KEY);
      return stored === null ? true : stored === 'true'; // Default on
    }
    return true;
  });

  const [catPattern, setCatPatternState] = useState<CatPattern>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAT_PATTERN_KEY);
      return (stored as CatPattern) || 'none';
    }
    return 'none';
  });

  const [previewPattern, setPreviewPattern] = useState<CatPattern | null>(null);

  const [currentReaction, setCurrentReaction] = useState<'habit_complete' | 'all_complete' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // Load user's equipped costume from database
  useEffect(() => {
    const loadEquippedCostume = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // First check user_settings for show_companion
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('show_companion, companion_type')
          .eq('user_id', user.id)
          .single();

        if (settingsData) {
          setLocalShowCompanion(settingsData.show_companion ?? true);
          setLocalCompanionType((settingsData.companion_type as CompanionType) || 'cat');
        }

        // Then check user_equipped_costume
        const { data: costumeData } = await supabase
          .from('user_equipped_costume')
          .select('costume_id')
          .eq('user_id', user.id)
          .single();

        if (costumeData?.costume_id) {
          // Get the costume details to find the costume type
          const { data: costumeDetails } = await supabase
            .from('cat_costumes')
            .select('name')
            .eq('id', costumeData.costume_id)
            .single();

          if (costumeDetails) {
            // Map costume name to costume type
            const costumeMap: Record<string, CostumeType> = {
              'Cozy Scarf': 'scarf',
              'Wizard Hat': 'wizard_hat',
              'Raincoat & Boots': 'raincoat',
              'Sleepy Nightcap': 'sleep_cap',
              'Headphones': 'headphones',
              'Flower Crown': 'flower_crown',
              'Bow Tie': 'bow_tie',
              'Santa Hat': 'santa_hat',
              'Royal Crown': 'crown',
              'Winter Beanie': 'winter_beanie',
              'Summer Sunhat': 'sunhat',
              'Cozy Sweater': 'sweater',
              'Hero Cape': 'cape',
              'Party Hat': 'party_hat',
              'Bunny Ears': 'bunny_ears',
              'Pirate Hat': 'pirate_hat',
              'Chef Hat': 'chef_hat',
              'Detective Hat': 'detective_hat',
              'Angel Halo': 'angel_halo',
            };
            const costumeType = costumeMap[costumeDetails.name] || 'none';
            setEquippedCostumeState(costumeType);
            localStorage.setItem(EQUIPPED_COSTUME_KEY, costumeType);
          }
        }
        
        initialized.current = true;
      } catch (error) {
        console.error('Error loading companion data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEquippedCostume();
  }, [user]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(COMPANION_SHOW_KEY, String(localShowCompanion));
    }
  }, [localShowCompanion, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(COMPANION_TYPE_KEY, localCompanionType);
    }
  }, [localCompanionType, user]);

  useEffect(() => {
    localStorage.setItem(EQUIPPED_COSTUME_KEY, equippedCostume);
  }, [equippedCostume]);

  useEffect(() => {
    localStorage.setItem(CAT_COLOR_KEY, catColor);
  }, [catColor]);

  useEffect(() => {
    localStorage.setItem(CAT_SIZE_KEY, String(catSize));
  }, [catSize]);

  useEffect(() => {
    localStorage.setItem(CAT_SOUNDS_KEY, String(catSoundsEnabled));
  }, [catSoundsEnabled]);

  useEffect(() => {
    localStorage.setItem(CAT_PATTERN_KEY, catPattern);
  }, [catPattern]);

  const setCatColor = useCallback((color: CatColor) => {
    setCatColorState(color);
    localStorage.setItem(CAT_COLOR_KEY, color);
  }, []);

  const setCatSize = useCallback((size: number) => {
    setCatSizeState(size);
    localStorage.setItem(CAT_SIZE_KEY, String(size));
  }, []);

  const setCatSoundsEnabled = useCallback((enabled: boolean) => {
    setCatSoundsEnabledState(enabled);
    localStorage.setItem(CAT_SOUNDS_KEY, String(enabled));
  }, []);

  const setCatPattern = useCallback((pattern: CatPattern) => {
    setCatPatternState(pattern);
    localStorage.setItem(CAT_PATTERN_KEY, pattern);
  }, []);

  const setShowCompanion = useCallback(async (show: boolean) => {
    setLocalShowCompanion(show);
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({ show_companion: show })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating show_companion:', error);
      }
    }
  }, [user]);

  const setCompanionType = useCallback(async (type: CompanionType) => {
    setLocalCompanionType(type);
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({ companion_type: type })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating companion_type:', error);
      }
    }
  }, [user]);

  const setEquippedCostume = useCallback(async (costume: CostumeType) => {
    setEquippedCostumeState(costume);
    localStorage.setItem(EQUIPPED_COSTUME_KEY, costume);

    if (user) {
      try {
        // Map costume type back to database costume name
        const costumeNameMap: Record<CostumeType, string | null> = {
          none: null,
          scarf: 'Cozy Scarf',
          wizard_hat: 'Wizard Hat',
          raincoat: 'Raincoat & Boots',
          sleep_cap: 'Sleepy Nightcap',
          headphones: 'Headphones',
          flower_crown: 'Flower Crown',
          bow_tie: 'Bow Tie',
          santa_hat: 'Santa Hat',
          crown: 'Royal Crown',
          winter_beanie: 'Winter Beanie',
          sunhat: 'Summer Sunhat',
          sweater: 'Cozy Sweater',
          cape: 'Hero Cape',
          party_hat: 'Party Hat',
          bunny_ears: 'Bunny Ears',
          pirate_hat: 'Pirate Hat',
          chef_hat: 'Chef Hat',
          detective_hat: 'Detective Hat',
          angel_halo: 'Angel Halo',
        };

        const costumeName = costumeNameMap[costume];
        let costumeId: string | null = null;

        if (costumeName) {
          // Get the costume ID from the database
          const { data: costumeData } = await supabase
            .from('cat_costumes')
            .select('id')
            .eq('name', costumeName)
            .single();

          costumeId = costumeData?.id || null;
        }

        // Check if user already has an equipped costume record
        const { data: existing } = await supabase
          .from('user_equipped_costume')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          await supabase
            .from('user_equipped_costume')
            .update({ costume_id: costumeId, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_equipped_costume')
            .insert({ user_id: user.id, costume_id: costumeId });
        }
      } catch (error) {
        console.error('Error updating equipped costume:', error);
      }
    }
  }, [user]);

  const triggerReaction = useCallback((type: 'habit_complete' | 'all_complete') => {
    setCurrentReaction(type);
    // Clear reaction after animation completes
    setTimeout(() => setCurrentReaction(null), 2000);
  }, []);

  return (
    <CompanionContext.Provider
      value={{
        showCompanion: localShowCompanion,
        setShowCompanion,
        companionType: localCompanionType,
        setCompanionType,
        equippedCostume,
        setEquippedCostume,
        catColor,
        setCatColor,
        catPattern,
        setCatPattern,
        previewPattern,
        setPreviewPattern,
        catSize,
        setCatSize,
        catSoundsEnabled,
        setCatSoundsEnabled,
        triggerReaction,
        currentReaction,
        isLoading,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
}
