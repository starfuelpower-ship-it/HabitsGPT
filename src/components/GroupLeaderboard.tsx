import { Flame, Trophy, Medal } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  streak: number;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
}

interface GroupLeaderboardProps {
  members: Member[];
  currentUserId: string;
}

export function GroupLeaderboard({ members, currentUserId }: GroupLeaderboardProps) {
  const sortedMembers = [...members].sort((a, b) => b.streak - a.streak);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 text-center text-sm text-muted-foreground font-medium">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 1:
        return 'bg-gray-400/10 border-gray-400/20';
      case 2:
        return 'bg-amber-600/10 border-amber-600/20';
      default:
        return 'bg-muted/30 border-transparent';
    }
  };

  return (
    <div className="ios-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {sortedMembers.map((member, index) => (
          <div
            key={member.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(index)} transition-all`}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(index)}
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium">
                {member.profile?.display_name?.[0]?.toUpperCase() || 
                 member.profile?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {member.profile?.display_name || member.profile?.email?.split('@')[0] || 'Unknown'}
                {member.user_id === currentUserId && (
                  <span className="text-xs text-muted-foreground ml-1">(you)</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="font-bold text-lg">{member.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
