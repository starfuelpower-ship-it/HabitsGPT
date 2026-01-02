import { useMusic } from '@/contexts/MusicContext';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Music, Volume2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRACK_NAMES = [
  'Rainy Morning Vibes 1',
  'Rainy Morning Vibes 2',
  'Sunlit Morning 1',
  'Sunlit Morning 2',
];

export function MusicSettings() {
  const { musicEnabled, setMusicEnabled, volume, setVolume, currentTrack, nextTrack } = useMusic();

  const getVolumeLabel = (value: number) => {
    if (value === 0) return 'Muted';
    if (value <= 25) return 'Quiet';
    if (value <= 50) return 'Low';
    if (value <= 75) return 'Medium';
    return 'Loud';
  };

  return (
    <div className="space-y-4">
      {/* Music Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="music-enabled" className="text-sm">
            Background Music
          </Label>
        </div>
        <Switch
          id="music-enabled"
          checked={musicEnabled}
          onCheckedChange={setMusicEnabled}
        />
      </div>

      {musicEnabled && (
        <>
          {/* Volume Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Volume</Label>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {getVolumeLabel(volume)}
              </span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Current Track & Skip */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Now Playing</p>
              <p className="text-sm font-medium truncate">{TRACK_NAMES[currentTrack]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              className="flex items-center gap-1"
            >
              <SkipForward className="w-4 h-4" />
              <span className="text-xs">Skip</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
