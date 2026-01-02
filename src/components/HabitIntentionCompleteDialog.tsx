import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Leaf, Archive, RefreshCw } from 'lucide-react';
import { CloudHabit } from '@/hooks/useCloudHabits';

interface HabitIntentionCompleteDialogProps {
  habit: CloudHabit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (habitId: string) => void;
  onLetRest: (habitId: string) => void;
  onArchive: (habitId: string) => void;
}

export function HabitIntentionCompleteDialog({
  habit,
  open,
  onOpenChange,
  onContinue,
  onLetRest,
  onArchive,
}: HabitIntentionCompleteDialogProps) {
  if (!habit) return null;

  const handleContinue = () => {
    onContinue(habit.id);
    onOpenChange(false);
  };

  const handleLetRest = () => {
    onLetRest(habit.id);
    onOpenChange(false);
  };

  const handleArchive = () => {
    onArchive(habit.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            You've reached your intention
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            "{habit.name}" has come to a gentle close. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleContinue}
            className="w-full h-12 rounded-xl gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Continue this habit
          </Button>
          
          <Button
            onClick={handleLetRest}
            variant="outline"
            className="w-full h-12 rounded-xl gap-2"
          >
            <Leaf className="w-4 h-4" />
            Let it rest for now
          </Button>
          
          <Button
            onClick={handleArchive}
            variant="ghost"
            className="w-full h-12 rounded-xl gap-2 text-muted-foreground"
          >
            <Archive className="w-4 h-4" />
            Archive it
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Your streak and progress are preserved no matter what you choose
        </p>
      </DialogContent>
    </Dialog>
  );
}
