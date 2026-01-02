import { useState } from 'react';
import { Check, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme, FREE_THEMES, PREMIUM_THEMES, ALL_THEMES } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ColorThemeId = 'default' | 'pastel' | 'forest' | 'sunset' | 'moonlight' | 'midnight' | 'moss' | 'stone' | 'lavender' | 'rose' | 'ocean' | 'cream' | 'dusk' | 'teal' | 'earth';

const THEME_PREVIEWS: Record<ColorThemeId, { bg: string; primary: string; accent: string }> = {
  default: {
    bg: 'bg-[hsl(35,45%,95%)]',
    primary: 'bg-[hsl(43,90%,58%)]',
    accent: 'bg-[hsl(165,45%,88%)]',
  },
  pastel: {
    bg: 'bg-[hsl(330,30%,97%)]',
    primary: 'bg-[hsl(330,70%,70%)]',
    accent: 'bg-[hsl(200,60%,90%)]',
  },
  forest: {
    bg: 'bg-[hsl(140,20%,96%)]',
    primary: 'bg-[hsl(150,50%,45%)]',
    accent: 'bg-[hsl(80,40%,85%)]',
  },
  sunset: {
    bg: 'bg-[hsl(30,40%,97%)]',
    primary: 'bg-[hsl(25,90%,55%)]',
    accent: 'bg-[hsl(45,80%,85%)]',
  },
  moonlight: {
    bg: 'bg-[hsl(220,25%,94%)]',
    primary: 'bg-[hsl(220,60%,60%)]',
    accent: 'bg-[hsl(200,40%,85%)]',
  },
  midnight: {
    bg: 'bg-[hsl(230,20%,12%)]',
    primary: 'bg-[hsl(230,50%,55%)]',
    accent: 'bg-[hsl(260,30%,30%)]',
  },
  moss: {
    bg: 'bg-[hsl(130,15%,94%)]',
    primary: 'bg-[hsl(140,40%,35%)]',
    accent: 'bg-[hsl(100,30%,80%)]',
  },
  stone: {
    bg: 'bg-[hsl(210,15%,94%)]',
    primary: 'bg-[hsl(210,20%,50%)]',
    accent: 'bg-[hsl(200,15%,85%)]',
  },
  lavender: {
    bg: 'bg-[hsl(270,30%,96%)]',
    primary: 'bg-[hsl(270,50%,65%)]',
    accent: 'bg-[hsl(40,40%,92%)]',
  },
  rose: {
    bg: 'bg-[hsl(350,30%,96%)]',
    primary: 'bg-[hsl(350,50%,60%)]',
    accent: 'bg-[hsl(30,40%,85%)]',
  },
  ocean: {
    bg: 'bg-[hsl(200,30%,96%)]',
    primary: 'bg-[hsl(200,70%,50%)]',
    accent: 'bg-[hsl(180,40%,88%)]',
  },
  cream: {
    bg: 'bg-[hsl(40,40%,96%)]',
    primary: 'bg-[hsl(35,70%,55%)]',
    accent: 'bg-[hsl(30,35%,90%)]',
  },
  dusk: {
    bg: 'bg-[hsl(280,25%,96%)]',
    primary: 'bg-[hsl(280,45%,55%)]',
    accent: 'bg-[hsl(260,30%,88%)]',
  },
  teal: {
    bg: 'bg-[hsl(175,25%,95%)]',
    primary: 'bg-[hsl(175,50%,40%)]',
    accent: 'bg-[hsl(160,35%,85%)]',
  },
  earth: {
    bg: 'bg-[hsl(30,25%,95%)]',
    primary: 'bg-[hsl(25,45%,40%)]',
    accent: 'bg-[hsl(40,30%,85%)]',
  },
};

export const ThemePicker = () => {
  const { colorTheme, setColorTheme, previewTheme, setPreviewTheme } = useTheme();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleThemeSelect = (themeId: ColorThemeId) => {
    const theme = ALL_THEMES.find(t => t.id === themeId);
    if (theme?.isFree || isPremium) {
      setColorTheme(themeId);
      setIsPreviewing(false);
    }
  };

  const handlePreview = (themeId: ColorThemeId) => {
    const theme = ALL_THEMES.find(t => t.id === themeId);
    if (!isPremium && !theme?.isFree) {
      setPreviewTheme(themeId);
      setIsPreviewing(true);
    }
  };

  const handleStopPreview = () => {
    setPreviewTheme(null);
    setIsPreviewing(false);
  };

  const activeTheme = previewTheme || colorTheme;

  const renderThemeCard = (theme: typeof ALL_THEMES[0], isLocked: boolean) => {
    const preview = THEME_PREVIEWS[theme.id];
    const isActive = activeTheme === theme.id;

    return (
      <div
        key={theme.id}
        className={cn(
          "relative p-3 rounded-xl border-2 transition-all",
          isActive
            ? "border-primary bg-primary/5"
            : "border-border",
          isLocked ? "cursor-default" : "cursor-pointer hover:border-primary/50"
        )}
        onClick={() => !isLocked && handleThemeSelect(theme.id)}
      >
        {/* Theme Preview Swatch */}
        <div className={cn(
          "w-full h-12 rounded-lg mb-2 flex items-center justify-center gap-1 p-2",
          preview.bg
        )}>
          <div className={cn("w-4 h-4 rounded-full", preview.primary)} />
          <div className={cn("w-3 h-3 rounded-full", preview.accent)} />
        </div>

        <p className="font-medium text-xs text-foreground truncate">{theme.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{theme.description}</p>

        {/* Active Check */}
        {isActive && !previewTheme && (
          <div className="absolute top-2 right-2">
            <Check className="w-4 h-4 text-primary" />
          </div>
        )}

        {/* Preview indicator */}
        {previewTheme === theme.id && (
          <div className="absolute top-2 right-2">
            <Eye className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}

        {/* Lock / Preview Button for non-premium */}
        {isLocked && previewTheme !== theme.id && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center gap-1">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(theme.id);
              }}
            >
              <Eye className="w-3 h-3" />
              Preview
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Color Theme</h3>
        {isPreviewing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopPreview}
            className="text-xs h-7 gap-1.5"
          >
            <EyeOff className="w-3 h-3" />
            Exit Preview
          </Button>
        )}
      </div>

      {/* Free Themes */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Free Themes</p>
        <div className="grid grid-cols-3 gap-2">
          {FREE_THEMES.map((theme) => renderThemeCard(theme, false))}
        </div>
      </div>

      {/* Premium Themes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Premium Themes</span>
          {!isPremium && <Lock className="w-3 h-3" />}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PREMIUM_THEMES.map((theme) => renderThemeCard(theme, !isPremium))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPremium && (
        <Button
          variant="outline"
          className="w-full mt-3 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => navigate('/premium')}
        >
          Unlock All Themes
        </Button>
      )}

      {/* Preview Banner */}
      {isPreviewing && previewTheme && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-sm font-medium text-foreground mb-2">
            Previewing: {ALL_THEMES.find(t => t.id === previewTheme)?.name}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={() => navigate('/premium')}
              className="text-xs"
            >
              Unlock Theme
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopPreview}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
