import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useHabitData } from '@/hooks/useHabitData';
import { useAchievements } from '@/hooks/useAchievements';
import { BottomTabBar } from '@/components/BottomTabBar';
import { PremiumLock } from '@/components/PremiumLock';
import { GentleReflection } from '@/components/GentleReflection';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { MOOD_OPTIONS, FREE_TIER_LIMITS } from '@/types/habit';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Daily quotes
const DAILY_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small steps every day lead to big changes.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
];

interface JournalEntry {
  id: string;
  date: string;
  mood_score: number;
  note: string;
  stress_level?: number;
}

export default function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { habits, logs } = useHabitData();
  const { checkAndAwardAchievements } = useAchievements();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [stressLevel, setStressLevel] = useState(50);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
  
  // Get random daily quote
  const dailyQuote = DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];

  // Fetch mood entry for selected date
  const fetchEntry = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .maybeSingle();

    if (data) {
      setMoodScore(data.mood_score);
      setNote(data.note || '');
    } else {
      setMoodScore(null);
      setNote('');
    }
  }, [user, dateStr]);

  // Fetch all entries for history
  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    const daysToFetch = isPremium ? 30 : FREE_TIER_LIMITS.statsHistoryDays;
    const startDate = format(subDays(new Date(), daysToFetch), 'yyyy-MM-dd');
    
    const { data } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date', { ascending: false });

    if (data) {
      setEntries(data);
    }
  }, [user, isPremium]);

  useEffect(() => {
    fetchEntry();
    fetchEntries();
  }, [fetchEntry, fetchEntries]);

  // Save mood entry
  const handleSave = async () => {
    if (!user || moodScore === null) return;

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('moods')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('moods')
          .update({
            mood_score: moodScore,
            note: note.trim() || null,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('moods')
          .insert({
            user_id: user.id,
            date: dateStr,
            mood_score: moodScore,
            note: note.trim() || null,
          });
      }

      toast.success('Journal saved!');
      fetchEntries();
      
      // Check achievements for journal entry
      checkAndAwardAchievements({
        journalEntry: note.trim().length > 0,
        journalCount: entries.length + 1,
        moodLogged: true,
        stressLogged: true,
      });
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Get completion summary for a date
  const getCompletionSummary = (date: string) => {
    const dayLogs = logs.filter(l => l.completed_at === date);
    const completed = dayLogs.filter(l => l.completed).length;
    return { completed, total: habits.length };
  };

  const todayCompletion = getCompletionSummary(dateStr);

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <p className="text-sm text-muted-foreground">Reflect on your day</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Date Navigator */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            className="p-2 rounded-xl hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>
          <button
            onClick={() => setSelectedDate(prev => subDays(prev, -1))}
            className="p-2 rounded-xl hover:bg-muted"
            disabled={isToday}
          >
            <ChevronRight className={cn('w-5 h-5', isToday && 'opacity-30')} />
          </button>
        </div>

        {/* Daily Quote */}
        <div className="ios-card p-4 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm italic text-foreground">"{dailyQuote.text}"</p>
              <p className="text-xs text-muted-foreground mt-1">— {dailyQuote.author}</p>
            </div>
          </div>
        </div>

        {/* Habit Summary */}
        <div className="ios-card p-4">
          <h3 className="font-semibold text-foreground mb-2">Habits</h3>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{todayCompletion.completed}</span>
            {' '}of{' '}
            <span className="font-semibold">{todayCompletion.total}</span>
            {' '}completed
          </p>
        </div>

        {/* Mood Selector */}
        <div className="ios-card p-4">
          <h3 className="font-semibold text-foreground mb-4">How are you feeling?</h3>
          <div className="flex justify-between">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setMoodScore(mood.score)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  moodScore === mood.score
                    ? 'bg-primary/20 scale-110'
                    : 'hover:bg-muted'
                )}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-xs text-muted-foreground">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stress Level */}
        <div className="ios-card p-4">
          <h3 className="font-semibold text-foreground mb-4">Stress Level</h3>
          <div className="space-y-3">
            <Slider
              value={[stressLevel]}
              onValueChange={([v]) => setStressLevel(v)}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>😌 Relaxed</span>
              <span>😰 Stressed</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="ios-card p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Notes</h3>
          <Textarea
            placeholder="Write about your day..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] rounded-xl resize-none"
          />
          {note.trim().length > 10 && (
            <GentleReflection 
              content={note} 
              isPremium={isPremium}
              onUpgrade={() => navigate('/premium')}
            />
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={moodScore === null || saving}
          className="w-full h-12 rounded-xl"
        >
          {saving ? 'Saving...' : 'Save Entry'}
        </Button>

        {/* History */}
        <div className="ios-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Entries</h3>
            {!isPremium && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Last 7 days
              </div>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries yet. Start journaling today!
            </p>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, isPremium ? 10 : 7).map((entry) => {
                const mood = MOOD_OPTIONS.find(m => m.score === entry.mood_score);
                return (
                  <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <span className="text-2xl">{mood?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{format(new Date(entry.date), 'MMM d')}</p>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground truncate">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isPremium && entries.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-4 rounded-xl"
              onClick={() => navigate('/premium')}
            >
              Unlock Full History
            </Button>
          )}
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
