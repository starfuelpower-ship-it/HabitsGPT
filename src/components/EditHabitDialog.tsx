import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudHabit } from '@/hooks/useCloudHabits';
import { usePremium } from '@/contexts/PremiumContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Trash2 } from 'lucide-react';
import { HabitIconPicker } from './HabitIconPicker';
import { HabitColorPicker } from './HabitColorPicker';
import { HabitDurationPicker, HabitDuration } from './HabitDurationPicker';
import { GentleHabitSuggestion } from './GentleHabitSuggestion';
import { OLD_CATEGORY_CONFIG, Category } from '@/types/habit';
import { triggerHaptic } from '@/hooks/useSoundEffects';

const categories: Category[] = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

interface EditHabitDialogProps {
  habit: CloudHabit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Pick<CloudHabit, 'name' | 'category' | 'notes' | 'color' | 'icon' | 'intention_duration' | 'intention_start_date'>>) => void;
  onDelete: (id: string) => void;
}

export function EditHabitDialog({ 
  habit, 
  open, 
  onOpenChange, 
  onUpdate, 
  onDelete 
}: EditHabitDialogProps) {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Custom');
  const [notes, setNotes] = useState('');
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const wasNotesFocusedRef = useRef(false);

  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('check-circle');
  const [intentionDuration, setIntentionDuration] = useState<HabitDuration>('ongoing');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
      setNotes(habit.notes || '');
      setColor(habit.color || '');
      setIcon(habit.icon || 'check-circle');
      setIntentionDuration(habit.intention_duration || 'ongoing');
    }
  }, [habit]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    wasNotesFocusedRef.current = document.activeElement === notesRef.current;
    setNotes(e.target.value);
    if (wasNotesFocusedRef.current) {
      requestAnimationFrame(() => {
        notesRef.current?.focus();
      });
    }
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
  }, []);

  const handleAcceptSuggestion = useCallback((gentlerName: string) => {
    setName(gentlerName);
  }, []);

  const handleUpgrade = useCallback(() => {
    navigate('/premium');
  }, [navigate]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !name.trim()) return;
    
    const today = new Date().toISOString().split('T')[0];
    const durationChanged = intentionDuration !== (habit.intention_duration || 'ongoing');
    
    onUpdate(habit.id, { 
      name: name.trim(), 
      category, 
      notes: notes.trim(),
      color: isPremium ? color : undefined,
      icon,
      intention_duration: intentionDuration === 'ongoing' ? null : intentionDuration,
      // Reset start date if duration changed to a timed option
      intention_start_date: durationChanged && intentionDuration !== 'ongoing' ? today : habit.intention_start_date,
    });
    onOpenChange(false);
  }, [habit, name, category, notes, color, icon, intentionDuration, isPremium, onUpdate, onOpenChange]);

  const handleDeleteClick = useCallback(() => {
    triggerHaptic('warning');
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!habit) return;
    triggerHaptic('heavy');
    onDelete(habit.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  }, [habit, onDelete, onOpenChange]);

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon, Color, and Name row */}
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
              <Label className="text-xs">Color</Label>
              <HabitColorPicker 
                value={color} 
                onChange={setColor}
                isPremium={isPremium}
                showPremiumLock={true}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="edit-habit-name" className="text-xs">Habit Name</Label>
              <Input
                id="edit-habit-name"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., Morning meditation"
                className="h-14 rounded-xl"
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

          <div className="space-y-2">
            <Label htmlFor="edit-habit-category">Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="edit-habit-category" className="rounded-xl">
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

          {/* Duration/Intention picker */}
          <HabitDurationPicker
            value={intentionDuration}
            onChange={setIntentionDuration}
          />

          {/* Notes - separate input with stable identity */}
          <div className="space-y-2">
            <Label htmlFor="edit-habit-notes">Notes (optional)</Label>
            <Textarea
              ref={notesRef}
              id="edit-habit-notes"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add any notes..."
              rows={3}
              className="rounded-xl resize-none"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteClick}
              className="flex-1 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={!name.trim()}>
              Save Changes
            </Button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Habit"
          description={`Are you sure you want to delete "${habit?.name}"? This will also reset your streak and cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </DialogContent>
    </Dialog>
  );
}
