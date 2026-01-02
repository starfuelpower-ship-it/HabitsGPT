import { useState, useRef } from 'react';
import { Share2, Twitter, Instagram, Download, Lock, X, Flame, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePremium } from '@/contexts/PremiumContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareMilestoneProps {
  habitName: string;
  habitIcon: string;
  streak: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLANT_STAGES = [
  { minStreak: 0, emoji: '🌱', label: 'Seedling' },
  { minStreak: 3, emoji: '🌿', label: 'Sprout' },
  { minStreak: 7, emoji: '🪴', label: 'Growing' },
  { minStreak: 14, emoji: '🌳', label: 'Thriving' },
  { minStreak: 30, emoji: '🌲', label: 'Mighty' },
  { minStreak: 60, emoji: '🏆', label: 'Legend' },
];

const getPlantStage = (streak: number) => {
  return [...PLANT_STAGES].reverse().find(s => streak >= s.minStreak) || PLANT_STAGES[0];
};

const ShareCard = ({ habitName, habitIcon, streak }: { habitName: string; habitIcon: string; streak: number }) => {
  const plantStage = getPlantStage(streak);
  
  return (
    <div className="w-[320px] h-[400px] rounded-3xl p-6 flex flex-col items-center justify-between bg-gradient-to-br from-primary/20 via-background to-accent/30 border border-border/50 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
      
      {/* Header */}
      <div className="text-center z-10">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Cozy Habits</p>
        <p className="text-sm text-muted-foreground mt-1">Streak Achievement</p>
      </div>

      {/* Main content */}
      <div className="text-center z-10 space-y-4">
        {/* Plant stage */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
            <span className="text-5xl">{plantStage.emoji}</span>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
            <span className="text-xs font-medium text-primary">{plantStage.label}</span>
          </div>
        </div>

        {/* Habit info */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{habitIcon}</span>
            <h3 className="text-xl font-bold text-foreground">{habitName}</h3>
          </div>
          
          {/* Streak count */}
          <div className="flex items-center justify-center gap-2 text-primary">
            <Flame className="w-6 h-6" />
            <span className="text-4xl font-black">{streak}</span>
            <span className="text-lg font-medium">days</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center z-10">
        <p className="text-xs text-muted-foreground">Building habits, one day at a time</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">dailyreset.app</p>
      </div>
    </div>
  );
};

export const ShareMilestone = ({ habitName, habitIcon, streak, open, onOpenChange }: ShareMilestoneProps) => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const generateShareText = () => {
    const plantStage = getPlantStage(streak);
    return `🔥 ${streak} day streak on "${habitName}"! ${plantStage.emoji}\n\nBuilding better habits with Cozy Habits. #habits #productivity #cozyhabits`;
  };

  const handleTwitterShare = () => {
    const text = generateShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
    toast.success('Opening Twitter...');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct text sharing, suggest copying
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    toast.success('Caption copied! Open Instagram to share your screenshot.');
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.error('Sharing not supported on this device');
      return;
    }

    try {
      await navigator.share({
        title: 'My Habit Streak',
        text: generateShareText(),
      });
      toast.success('Shared successfully!');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  const handleDownload = async () => {
    setIsSharing(true);
    
    // Use html2canvas-like approach with SVG
    try {
      const card = cardRef.current;
      if (!card) return;

      // Create a canvas from the card (simplified approach)
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 640, 800);
      gradient.addColorStop(0, '#fce7f3');
      gradient.addColorStop(0.5, '#fdf2f8');
      gradient.addColorStop(1, '#ecfdf5');
      ctx.fillStyle = gradient;
      ctx.roundRect(0, 0, 640, 800, 48);
      ctx.fill();

      // Draw plant emoji
      ctx.font = '100px Arial';
      ctx.textAlign = 'center';
      const plantStage = getPlantStage(streak);
      ctx.fillText(plantStage.emoji, 320, 320);

      // Draw habit icon
      ctx.font = '48px Arial';
      ctx.fillText(habitIcon, 280, 440);

      // Draw habit name
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 36px system-ui';
      ctx.fillText(habitName, 320, 480);

      // Draw streak
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 72px system-ui';
      ctx.fillText(`🔥 ${streak} days`, 320, 580);

      // Draw footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '20px system-ui';
      ctx.fillText('Cozy Habits', 320, 720);
      ctx.font = '16px system-ui';
      ctx.fillText('Building habits, one day at a time', 320, 750);

      // Download
      const link = document.createElement('a');
      link.download = `streak-${habitName.toLowerCase().replace(/\s+/g, '-')}-${streak}days.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isPremium) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Streak
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Premium Feature</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share your achievements and inspire others with Premium
              </p>
            </div>
            <Button onClick={() => { onOpenChange(false); navigate('/premium'); }} className="w-full">
              Unlock Sharing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Preview card */}
          <div ref={cardRef} className="flex justify-center">
            <div className="transform scale-[0.85] origin-top">
              <ShareCard habitName={habitName} habitIcon={habitIcon} streak={streak} />
            </div>
          </div>

          {/* Share buttons */}
          <div className="space-y-3">
            <p className="text-xs text-center text-muted-foreground">Share your streak milestone</p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleTwitterShare}
                className="h-12 gap-2"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={handleInstagramShare}
                className="h-12 gap-2"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isSharing}
                className="h-12 gap-2"
              >
                <Download className="w-5 h-5" />
                {isSharing ? 'Saving...' : 'Save Image'}
              </Button>

              {navigator.share && (
                <Button
                  variant="default"
                  onClick={handleNativeShare}
                  className="h-12 gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to trigger share dialog
export const useShareMilestone = () => {
  const [shareData, setShareData] = useState<{
    habitName: string;
    habitIcon: string;
    streak: number;
  } | null>(null);

  const openShare = (habitName: string, habitIcon: string, streak: number) => {
    setShareData({ habitName, habitIcon, streak });
  };

  const closeShare = () => {
    setShareData(null);
  };

  return {
    shareData,
    openShare,
    closeShare,
    isOpen: !!shareData,
  };
};
