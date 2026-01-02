import { useState, useCallback, memo, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { HabitIconPicker } from './HabitIconPicker';
import { HabitColorPicker } from './HabitColorPicker';
import { HabitDurationPicker, HabitDuration } from './HabitDurationPicker';
import { GentleHabitSuggestion } from './GentleHabitSuggestion';
import { usePremium } from '@/contexts/PremiumContext';
import { Badge } from '@/components/ui/badge';

const categories: Category[] = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

const HABIT_SUGGESTIONS: Record<Category, string[]> = {
  Health: [
    'Drink 8 glasses of water',
    'Take vitamins',
    'Eat breakfast',
    'Sleep 8 hours',
    'No sugar today',
    'Eat fruits & veggies',
    'Meal prep',
    'No late night snacks',
    'Floss teeth',
    'Take medications',
    'Limit caffeine',
    'Eat protein',
    'No processed food',
    'Drink green tea',
    'Skincare routine',
    'Eye care breaks',
    'Posture check',
    'Dental hygiene',
    'Healthy snacks only',
    'Track calories',
    'Limit alcohol',
    'Eat mindfully',
    'Cook at home',
    'Pack lunch',
  ],
  Productivity: [
    'Wake up early',
    'Plan my day',
    'No social media until noon',
    'Deep work session',
    'Clear email inbox',
    'Review daily goals',
    'Learn something new',
    'Read 30 minutes',
    'Write 500 words',
    'Weekly review',
    'Time blocking',
    'Pomodoro session',
    'Batch similar tasks',
    'Prepare tomorrow',
    'Single-tasking',
    'Declutter desk',
    'Review notes',
    'Update to-do list',
    'Limit meetings',
    'Morning routine',
    'Evening wind-down',
    'No phone first hour',
    'Complete top 3 tasks',
    'Inbox zero',
  ],
  Fitness: [
    'Morning workout',
    'Walk 10,000 steps',
    'Stretch for 10 min',
    'Go to the gym',
    'Do yoga',
    'Take the stairs',
    'Evening run',
    'Core exercises',
    'Upper body workout',
    'Lower body workout',
    'HIIT session',
    'Swimming',
    'Cycling',
    'Dance workout',
    'Pilates',
    'Mobility exercises',
    'Foam rolling',
    'Jump rope',
    'Plank challenge',
    'Squats & lunges',
    'Push-ups daily',
    'Active recovery',
    'Sports practice',
    'Outdoor hike',
  ],
  Mindset: [
    'Morning meditation',
    'Practice gratitude',
    'Journal thoughts',
    'Positive affirmations',
    'Breathwork session',
    'Digital detox hour',
    'Call a friend',
    'Random act of kindness',
    'Visualization practice',
    'Read inspirational content',
    'Listen to podcast',
    'Write 3 wins',
    'Forgiveness practice',
    'Mindful eating',
    'Body scan meditation',
    'Set daily intention',
    'Evening reflection',
    'Self-compassion pause',
    'Nature walk',
    'Gratitude letter',
    'Learn from failure',
    'Celebrate small wins',
    'Practice patience',
    'Reduce complaining',
  ],
  Custom: [
    'Practice instrument',
    'Water plants',
    'Tidy workspace',
    'No spending day',
    'Creative time',
    'Learn a language',
    'Side project work',
    'Self-care routine',
    'Photography practice',
    'Drawing or sketching',
    'Cooking new recipe',
    'Budget review',
    'Home maintenance',
    'Car care',
    'Pet care routine',
    'Call family',
    'Volunteer time',
    'Craft project',
    'Garden care',
    'Organize closet',
    'Update finances',
    'Plan weekend',
    'Tech-free time',
    'Hobby practice',
  ],
};

interface AddHabitDialogProps {
  onAdd?: (name: string, category: string, notes: string, icon?: string, color?: string, intentionDuration?: HabitDuration) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (
    name: string,
    category: Category,
    icon: string,
    notes?: string,
    color?: string,
    intentionDuration?: HabitDuration
  ) => Promise<boolean>;
}

// Memoized suggestion badge to prevent re-renders
const SuggestionBadge = memo(({ suggestion, onClick }: { suggestion: string; onClick: () => void }) => (
  <Badge
    variant="secondary"
    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs py-1 px-2"
    onClick={onClick}
  >
    {suggestion}
  </Badge>
));
SuggestionBadge.displayName = 'SuggestionBadge';

export function AddHabitDialog({ onAdd, open: controlledOpen, onOpenChange, onSave }: AddHabitDialogProps) {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Health');
  const [icon, setIcon] = useState('check-circle');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const wasNotesFocusedRef = useRef(false);

  const [intentionDuration, setIntentionDuration] = useState<HabitDuration>('ongoing');
  const [saving, setSaving] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const resetForm = useCallback(() => {
    setName('');
    setCategory('Health');
    setIcon('check-circle');
    setColor('');
    setNotes('');
    setIntentionDuration('ongoing');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalColor = isPremium ? color : '';
    const finalDuration = intentionDuration === 'ongoing' ? null : intentionDuration;

    if (onSave) {
      setSaving(true);
      const success = await onSave(name.trim(), category, icon, notes.trim() || undefined, finalColor || undefined, finalDuration);
      setSaving(false);
      if (success) {
        resetForm();
        setOpen(false);
      }
    } else if (onAdd) {
      onAdd(name.trim(), category, notes.trim(), icon, finalColor, finalDuration);
      resetForm();
      setOpen(false);
    }
  };

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  }, [setOpen, resetForm]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setName(suggestion);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Preserve focus on mobile/webviews where re-renders can steal focus
    wasNotesFocusedRef.current = document.activeElement === notesRef.current;
    setNotes(e.target.value);
    if (wasNotesFocusedRef.current) {
      requestAnimationFrame(() => {
        notesRef.current?.focus();
      });
    }
  }, []);

  const handleCategoryChange = useCallback((v: string) => {
    setCategory(v as Category);
  }, []);

  const handleAcceptSuggestion = useCallback((gentlerName: string) => {
    setName(gentlerName);
  }, []);

  const handleUpgrade = useCallback(() => {
    navigate('/premium');
  }, [navigate]);

  const suggestions = HABIT_SUGGESTIONS[category];

  // Form content rendered inline - NOT as a separate function component
  // This prevents remounting and focus loss issues
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      {/* Icon and Color pickers */}
      <div className="flex items-start gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Icon</Label>
          <HabitIconPicker 
            value={icon} 
            onChange={setIcon} 
            color={color || undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            Color
          </Label>
          <HabitColorPicker 
            value={color} 
            onChange={setColor}
            isPremium={isPremium}
            showPremiumLock={true}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="add-habit-name" className="text-xs">Habit Name</Label>
          <Input
            id="add-habit-name"
            placeholder="e.g., Morning workout"
            value={name}
            onChange={handleNameChange}
            className="h-14 rounded-xl text-base"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Gentle AI suggestion */}
      {name.trim().length >= 3 && (
        <GentleHabitSuggestion
          habitName={name}
          isPremium={isPremium}
          onAccept={handleAcceptSuggestion}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: OLD_CATEGORY_CONFIG[cat].color }}
                  />
                  {cat}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick suggestions</Label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <SuggestionBadge
              key={suggestion}
              suggestion={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
            />
          ))}
        </div>
      </div>

      {/* Duration/Intention picker */}
      <HabitDurationPicker
        value={intentionDuration}
        onChange={setIntentionDuration}
      />

      {/* Notes - separate from title, stable identity */}
      <div className="space-y-2">
        <Label htmlFor="add-habit-notes">Notes (optional)</Label>
        <Textarea
          ref={notesRef}
          id="add-habit-notes"
          placeholder="Add any notes or details..."
          value={notes}
          onChange={handleNotesChange}
          className="rounded-xl resize-none"
          rows={2}
          autoComplete="off"
        />
      </div>

      {/* Save button */}
      <Button
        type="submit"
        disabled={!name.trim() || saving}
        className="w-full h-12 rounded-xl text-base font-semibold"
      >
        {saving ? 'Creating...' : 'Create Habit'}
      </Button>
    </form>
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Add New Habit
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 h-12 text-base rounded-xl shadow-soft-sm">
          <Plus className="w-5 h-5" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Habit</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
