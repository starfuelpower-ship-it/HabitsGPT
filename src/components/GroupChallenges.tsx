import { useState } from 'react';
import { Target, Plus, Calendar, Users, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, differenceInDays } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  target_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  progress?: { user_id: string; progress_count: number; completed: boolean }[];
}

interface GroupChallengesProps {
  challenges: Challenge[];
  currentUserId: string;
  onCreateChallenge: (title: string, description: string, targetCount: number, endDate: string) => void;
}

export const GroupChallenges = ({ challenges, currentUserId, onCreateChallenge }: GroupChallengesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCount, setTargetCount] = useState(100);
  const [endDate, setEndDate] = useState('');

  const handleCreate = () => {
    if (title && endDate) {
      onCreateChallenge(title, description, targetCount, endDate);
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setTargetCount(100);
      setEndDate('');
    }
  };

  const activeChallenges = challenges.filter(c => c.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Monthly Challenges
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Challenge Title</Label>
                <Input 
                  placeholder="e.g., 100 Workouts Together"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input 
                  placeholder="Describe the challenge..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Count</Label>
                <Input 
                  type="number"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Challenge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeChallenges.length === 0 ? (
        <Card className="p-6 text-center bg-muted/30">
          <Trophy className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No active challenges</p>
          <p className="text-xs text-muted-foreground mt-1">Create one to motivate your group!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeChallenges.map((challenge) => {
            const totalProgress = challenge.progress?.reduce((sum, p) => sum + p.progress_count, 0) || 0;
            const progressPercent = Math.min((totalProgress / challenge.target_count) * 100, 100);
            const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
            const isCompleted = progressPercent >= 100;

            return (
              <Card 
                key={challenge.id} 
                className={`p-4 ${isCompleted ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Target className="w-5 h-5 text-primary" />
                      )}
                      <h4 className="font-semibold">{challenge.title}</h4>
                    </div>
                    {challenge.description && (
                      <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {challenge.progress?.length || 0} contributors
                    </span>
                    <span className="font-semibold">
                      {totalProgress}/{challenge.target_count}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
