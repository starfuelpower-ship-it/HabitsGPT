import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ArchiveRestore } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudHabits, CloudHabit } from '@/hooks/useCloudHabits';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  Health: 'hsl(145, 50%, 45%)',
  Productivity: 'hsl(220, 60%, 55%)',
  Fitness: 'hsl(25, 80%, 55%)',
  Mindset: 'hsl(280, 45%, 55%)',
  Custom: 'hsl(190, 50%, 50%)',
};

export default function HabitManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { habits, deleteHabit, refreshHabits } = useCloudHabits();
  const [archivedHabits, setArchivedHabits] = useState<CloudHabit[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const fetchArchived = async () => {
    if (!user) return;
    const { data } = await supabase.from('habits').select('*').eq('user_id', user.id).eq('archived', true);
    if (data) setArchivedHabits(data as CloudHabit[]);
    setShowArchived(true);
  };

  const archiveHabit = async (id: string) => {
    const { error } = await supabase.rpc('archive_habit', { _habit_id: id });
    if (error) {
      toast.error('Failed to archive habit');
      return;
    }
    refreshHabits();
    toast.success('Archived');
  };

  const restoreHabit = async (id: string) => {
    const { error } = await supabase.rpc('restore_habit', { _habit_id: id });
    if (error) {
      toast.error('Failed to restore habit');
      return;
    }
    setArchivedHabits(prev => prev.filter(h => h.id !== id));
    refreshHabits();
    toast.success('Restored');
  };

  if (!user) { navigate('/auth'); return null; }

  const displayedHabits = showArchived ? archivedHabits : habits;

  return (
    <div className="min-h-screen pb-8 bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Habit Manager</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button onClick={() => setShowArchived(false)} className={cn('flex-1 py-2 rounded-lg text-sm font-medium', !showArchived ? 'bg-card shadow-sm' : 'text-muted-foreground')}>Active ({habits.length})</button>
          <button onClick={fetchArchived} className={cn('flex-1 py-2 rounded-lg text-sm font-medium', showArchived ? 'bg-card shadow-sm' : 'text-muted-foreground')}>Archived</button>
        </div>

        {displayedHabits.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">{showArchived ? 'No archived habits' : 'No habits yet'}</p>
        ) : (
          <div className="space-y-3">
            {displayedHabits.map((habit) => (
              <div key={habit.id} className="ios-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[habit.category] || '#ccc'}20` }}>
                  <span className="text-xl">{habit.color ? '🎨' : '✅'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">{habit.category}</p>
                </div>
                {showArchived ? (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => restoreHabit(habit.id)}><ArchiveRestore className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => archiveHabit(habit.id)}>Archive</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
