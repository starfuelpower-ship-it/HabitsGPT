import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MOOD_OPTIONS } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// DAILY REFLECTION MODAL
// ============================================
// Appears when all habits are completed for the day
// Saves to the moods/journal table

interface DailyReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedCount: number;
  totalCount: number;
}

const CELEBRATION_MESSAGES = [
  "Wonderful work today! 🎉",
  "You showed up! 💚",
  "A cozy day complete! ⭐",
  "All habits done! 🌿",
  "Beautifully done! 🌟",
];

export function DailyReflectionModal({ 
  open, 
  onOpenChange, 
  completedCount, 
  totalCount 
}: DailyReflectionModalProps) {
  const { user } = useAuth();
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [stressLevel, setStressLevel] = useState(30);
  const [saving, setSaving] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const celebrationMessage = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];

  // Check for existing entry when modal opens
  useEffect(() => {
    if (open && user) {
      checkExistingEntry();
    }
  }, [open, user]);

  const checkExistingEntry = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      setMoodScore(data.mood_score);
      setNote(data.note || '');
      setHasExistingEntry(true);
    } else {
      setMoodScore(null);
      setNote('');
      setHasExistingEntry(false);
    }
  };

  const handleSave = async () => {
    if (!user || moodScore === null) return;

    setSaving(true);
    try {
      const entryData = {
        user_id: user.id,
        date: today,
        mood_score: moodScore,
        note: note.trim() || null,
      };

      if (hasExistingEntry) {
        await supabase
          .from('moods')
          .update({ mood_score: moodScore, note: note.trim() || null })
          .eq('user_id', user.id)
          .eq('date', today);
      } else {
        await supabase
          .from('moods')
          .insert(entryData);
      }

      toast.success('Reflection saved! Check your Journal for history.');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMoodScore(null);
    setNote('');
    setStressLevel(30);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-3xl p-0 overflow-hidden border-0">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 p-6 pb-8">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {celebrationMessage}
            </h2>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} habits completed
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 -mt-4 bg-card rounded-t-3xl">
          {/* Mood Selector */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">How do you feel?</h3>
            <div className="flex justify-between">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.score}
                  onClick={() => setMoodScore(mood.score)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200',
                    moodScore === mood.score
                      ? 'bg-primary/20 scale-110 shadow-sm'
                      : 'hover:bg-muted hover:scale-105'
                  )}
                >
                  <span className={cn(
                    'text-2xl transition-transform duration-200',
                    moodScore === mood.score && 'animate-bounce-in'
                  )}>
                    {mood.emoji}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Day Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Rate your day</h3>
              <span className="text-xs text-muted-foreground">{stressLevel}%</span>
            </div>
            <Slider
              value={[stressLevel]}
              onValueChange={([v]) => setStressLevel(v)}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Could be better</span>
              <span>Amazing!</span>
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Quick reflection</h3>
            <Textarea
              placeholder="What went well today? Any wins or learnings?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] rounded-xl resize-none text-sm"
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground text-right mt-1">
              {note.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 rounded-xl"
            >
              Skip
            </Button>
            <Button
              onClick={handleSave}
              disabled={moodScore === null || saving}
              className="flex-1 rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
