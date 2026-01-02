import { Share2, Download, Flame, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ShareableStreakCardProps {
  userName: string;
  streak: number;
  groupName: string;
  rank: number;
  totalXP: number;
}

export const ShareableStreakCard = ({ 
  userName, 
  streak, 
  groupName, 
  rank, 
  totalXP 
}: ShareableStreakCardProps) => {
  const handleShare = async () => {
    const shareText = `🔥 ${userName} is on a ${streak}-day streak in "${groupName}"!\n\n🏆 Rank: #${rank}\n⭐ XP: ${totalXP}\n\nJoin us on Cozy Habits!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Streak Card',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share your streak with friends",
      });
    }
  };

  const getRankBadge = () => {
    if (rank === 1) return { icon: '🥇', bg: 'bg-gradient-to-br from-yellow-300 to-amber-500' };
    if (rank === 2) return { icon: '🥈', bg: 'bg-gradient-to-br from-gray-300 to-gray-400' };
    if (rank === 3) return { icon: '🥉', bg: 'bg-gradient-to-br from-orange-300 to-orange-500' };
    return { icon: `#${rank}`, bg: 'bg-gradient-to-br from-primary/20 to-primary/40' };
  };

  const badge = getRankBadge();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 border-2 border-primary/20 p-6">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Streak Card
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="hover:bg-primary/10"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Main stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl ${badge.bg} flex items-center justify-center text-2xl shadow-lg`}>
            {typeof badge.icon === 'string' && badge.icon.startsWith('#') ? (
              <span className="text-lg font-bold text-foreground">{badge.icon}</span>
            ) : (
              badge.icon
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{userName}</h3>
            <p className="text-sm text-muted-foreground">{groupName}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/60 backdrop-blur rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <span className="text-xl font-bold">{streak}</span>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="bg-background/60 backdrop-blur rounded-xl p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <span className="text-xl font-bold">#{rank}</span>
            <p className="text-xs text-muted-foreground">Rank</p>
          </div>
          <div className="bg-background/60 backdrop-blur rounded-xl p-3 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <span className="text-xl font-bold">{totalXP}</span>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
