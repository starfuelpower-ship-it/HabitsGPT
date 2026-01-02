import { useEffect } from 'react';
import { useCompanion, CAT_COLORS, CatColor, CAT_PATTERNS, CatPattern } from '@/contexts/CompanionContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Cat, Palette, ChevronRight, Maximize2, Volume2, VolumeX, Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function CompanionSettings() {
  const { 
    showCompanion, 
    setShowCompanion, 
    catSize, 
    setCatSize, 
    catSoundsEnabled, 
    setCatSoundsEnabled, 
    catColor, 
    setCatColor,
    catPattern,
    setCatPattern,
    previewPattern,
    setPreviewPattern
  } = useCompanion();
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  // Clear preview pattern when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      setPreviewPattern(null);
    };
  }, [setPreviewPattern]);

  const handlePatternSelect = (pattern: CatPattern) => {
    if (pattern === 'none') {
      setCatPattern(pattern);
      setPreviewPattern(null);
      return;
    }
    
    if (isPremium) {
      setCatPattern(pattern);
      setPreviewPattern(null);
    } else {
      // Preview the pattern temporarily
      setPreviewPattern(pattern);
      toast({
        title: "Premium Pattern",
        description: "Upgrade to premium to keep this adorable pattern!",
        action: (
          <Button size="sm" variant="default" onClick={() => navigate('/premium')}>
            Upgrade
          </Button>
        ),
      });
    }
  };

  const displayPattern = previewPattern || catPattern;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cat className="w-4 h-4 text-muted-foreground" />
          <div>
            <Label htmlFor="show-companion" className="text-sm">
              Show Cat Companion
            </Label>
            <p className="text-xs text-muted-foreground">
              A cute animated cat that reacts to your habits
            </p>
          </div>
        </div>
        <Switch
          id="show-companion"
          checked={showCompanion}
          onCheckedChange={setShowCompanion}
        />
      </div>

      {showCompanion && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-sm">Cat Size</Label>
                <p className="text-xs text-muted-foreground">
                  Adjust how big the cat appears
                </p>
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {Math.round(catSize * 100)}%
              </span>
            </div>
            <Slider
              value={[catSize]}
              onValueChange={([value]) => setCatSize(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Cat Color Picker */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Cat Color</Label>
                <p className="text-xs text-muted-foreground">
                  Choose your cat's fur color
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CAT_COLORS) as CatColor[]).map((colorKey) => (
                <button
                  key={colorKey}
                  onClick={() => setCatColor(colorKey)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    catColor === colorKey 
                      ? 'border-primary ring-2 ring-primary/30 scale-110' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: CAT_COLORS[colorKey].body }}
                  title={CAT_COLORS[colorKey].name}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {CAT_COLORS[catColor].name}
            </p>
          </div>

          {/* Cat Pattern Picker - Premium Feature */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Fur Pattern</Label>
                    {!isPremium && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <Lock className="w-2.5 h-2.5 mr-0.5" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPremium ? 'Add unique markings to your cat' : 'Preview patterns & upgrade to keep'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(CAT_PATTERNS) as CatPattern[]).map((patternKey) => {
                const pattern = CAT_PATTERNS[patternKey];
                const isSelected = displayPattern === patternKey;
                const isLocked = !isPremium && patternKey !== 'none';
                
                return (
                  <button
                    key={patternKey}
                    onClick={() => handlePatternSelect(patternKey)}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    title={`${pattern.name}: ${pattern.description}`}
                  >
                    <span className="text-lg">{pattern.icon}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 truncate w-full text-center">
                      {pattern.name}
                    </span>
                    {isLocked && (
                      <div className="absolute top-0.5 right-0.5">
                        <Lock className="w-2.5 h-2.5 text-muted-foreground/50" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {previewPattern && !isPremium && (
              <p className="text-xs text-primary animate-pulse text-center">
                Previewing {CAT_PATTERNS[previewPattern].name} pattern
              </p>
            )}
          </div>

          {/* Cat Sounds Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              {catSoundsEnabled ? (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="cat-sounds" className="text-sm">
                  Cat Sounds
                </Label>
                <p className="text-xs text-muted-foreground">
                  Meows, purrs, and chirps
                </p>
              </div>
            </div>
            <Switch
              id="cat-sounds"
              checked={catSoundsEnabled}
              onCheckedChange={setCatSoundsEnabled}
            />
          </div>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => navigate('/cat')}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Customize Cat Costume</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </>
      )}
    </div>
  );
}
