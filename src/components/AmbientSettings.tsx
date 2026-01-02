import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CloudRain, Sun, Snowflake, XCircle, Eye, Sparkles, Flame, Flower2, Leaf, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const AMBIENT_OPTIONS: { id: AmbientMode; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { id: 'off', label: 'Off', icon: XCircle, description: 'No effects' },
  { id: 'rain', label: 'Rain', icon: CloudRain, description: 'Soft raindrops' },
  { id: 'sun_rays', label: 'Sun Rays', icon: Sun, description: 'Warm light rays' },
  { id: 'snow', label: 'Snow', icon: Snowflake, description: 'Gentle snowfall' },
  { id: 'fireflies', label: 'Fireflies', icon: Flame, description: 'Glowing lights' },
  { id: 'cherry_blossoms', label: 'Blossoms', icon: Flower2, description: 'Falling petals' },
  { id: 'autumn_leaves', label: 'Autumn', icon: Leaf, description: 'Drifting leaves' },
];

export function AmbientSettings() {
  const {
    ambientMode,
    setAmbientMode,
    visualsEnabled,
    setVisualsEnabled,
    soundsEnabled,
    setSoundsEnabled,
    soundVolume,
    setSoundVolume,
    intensity,
    setIntensity,
    turnOffAllAmbience,
  } = useAmbient();

  // Use ambient audio hook
  useAmbientAudio(ambientMode, soundsEnabled, soundVolume / 100);

  const getIntensityLabel = (value: number) => {
    if (value <= 25) return 'Subtle';
    if (value <= 50) return 'Light';
    if (value <= 75) return 'Medium';
    return 'Visible';
  };

  const getVolumeLabel = (value: number) => {
    if (value <= 20) return 'Quiet';
    if (value <= 40) return 'Soft';
    if (value <= 60) return 'Medium';
    return 'Audible';
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Atmosphere Style</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMBIENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = ambientMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setAmbientMode(option.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  isSelected
                    ? 'bg-primary/10 border-primary/50 text-primary'
                    : 'bg-background border-border/50 hover:bg-muted/50'
                )}
              >
                <Icon className={cn('w-5 h-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <div className="text-left">
                  <div className={cn('font-medium text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity Slider */}
      {ambientMode !== 'off' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm">Visual Intensity</Label>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {getIntensityLabel(intensity)}
            </span>
          </div>
          <Slider
            value={[intensity]}
            onValueChange={([value]) => setIntensity(value)}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      )}

      {/* Visuals Toggle */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="ambient-visuals" className="text-sm">
              Ambient Visuals
            </Label>
          </div>
          <Switch
            id="ambient-visuals"
            checked={visualsEnabled}
            onCheckedChange={setVisualsEnabled}
          />
        </div>
      </div>

      {/* Ambient Sounds Toggle */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {soundsEnabled ? (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="ambient-sounds" className="text-sm">
                Ambient Sounds
              </Label>
              <p className="text-xs text-muted-foreground">
                Matches atmosphere style
              </p>
            </div>
          </div>
          <Switch
            id="ambient-sounds"
            checked={soundsEnabled}
            onCheckedChange={setSoundsEnabled}
          />
        </div>
      </div>

      {/* Sound Volume Slider */}
      {soundsEnabled && ambientMode !== 'off' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm">Sound Volume</Label>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {getVolumeLabel(soundVolume)}
            </span>
          </div>
          <Slider
            value={[soundVolume]}
            onValueChange={([value]) => setSoundVolume(value)}
            min={10}
            max={80}
            step={5}
            className="w-full"
          />
        </div>
      )}

      {/* Quick disable button */}
      {(visualsEnabled || soundsEnabled || ambientMode !== 'off') && (
        <button
          onClick={turnOffAllAmbience}
          className="w-full mt-2 py-2 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border/50 hover:bg-muted/30"
        >
          Turn off all ambience
        </button>
      )}
    </div>
  );
}
