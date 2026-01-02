import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Heart,
  Dumbbell,
  Book,
  Brain,
  Wallet,
  Droplets,
  Apple,
  Moon,
  Sun,
  Target,
  Briefcase,
  Pencil,
  Palette,
  Music,
  Star,
  Coffee,
  Pill,
  Footprints,
  Bike,
  Timer,
  Leaf,
  Smile,
  Zap,
  Clock,
  CheckCircle,
  Trophy,
  Flame,
  Utensils,
  Bed,
  type LucideIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

// ============================================
// HABIT ICON PICKER
// ============================================
// Lucide line icons for habit customization

export interface HabitIconOption {
  name: string;
  icon: LucideIcon;
  label: string;
}

export const HABIT_LINE_ICONS: HabitIconOption[] = [
  { name: 'heart', icon: Heart, label: 'Health' },
  { name: 'dumbbell', icon: Dumbbell, label: 'Gym' },
  { name: 'book', icon: Book, label: 'Reading' },
  { name: 'brain', icon: Brain, label: 'Meditation' },
  { name: 'wallet', icon: Wallet, label: 'Finance' },
  { name: 'droplets', icon: Droplets, label: 'Water' },
  { name: 'apple', icon: Apple, label: 'Nutrition' },
  { name: 'moon', icon: Moon, label: 'Sleep' },
  { name: 'sun', icon: Sun, label: 'Morning' },
  { name: 'target', icon: Target, label: 'Goals' },
  { name: 'briefcase', icon: Briefcase, label: 'Work' },
  { name: 'pencil', icon: Pencil, label: 'Writing' },
  { name: 'palette', icon: Palette, label: 'Creative' },
  { name: 'music', icon: Music, label: 'Music' },
  { name: 'star', icon: Star, label: 'Habits' },
  { name: 'coffee', icon: Coffee, label: 'Coffee' },
  { name: 'pill', icon: Pill, label: 'Medicine' },
  { name: 'footprints', icon: Footprints, label: 'Walking' },
  { name: 'bike', icon: Bike, label: 'Cycling' },
  { name: 'timer', icon: Timer, label: 'Timer' },
  { name: 'leaf', icon: Leaf, label: 'Nature' },
  { name: 'smile', icon: Smile, label: 'Mood' },
  { name: 'zap', icon: Zap, label: 'Energy' },
  { name: 'clock', icon: Clock, label: 'Time' },
  { name: 'check-circle', icon: CheckCircle, label: 'Tasks' },
  { name: 'trophy', icon: Trophy, label: 'Achievement' },
  { name: 'flame', icon: Flame, label: 'Streak' },
  { name: 'utensils', icon: Utensils, label: 'Eating' },
  { name: 'bed', icon: Bed, label: 'Rest' },
];

interface HabitIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function HabitIconPicker({ value, onChange, color }: HabitIconPickerProps) {
  const [open, setOpen] = useState(false);
  
  const selectedIcon = HABIT_LINE_ICONS.find(i => i.name === value);
  const SelectedIconComponent = selectedIcon?.icon || CheckCircle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-14 h-14 rounded-xl p-0 flex items-center justify-center"
          style={color ? { 
            borderColor: `${color}50`,
            backgroundColor: `${color}15`,
          } : undefined}
        >
          <SelectedIconComponent 
            className="w-6 h-6" 
            style={color ? { color } : undefined}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 bg-card border-border z-50" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Choose an icon</p>
          <div className="grid grid-cols-6 gap-1.5">
            {HABIT_LINE_ICONS.map(({ name, icon: Icon, label }) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105',
                  value === name
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
                title={label}
                style={value === name && color ? { 
                  backgroundColor: color,
                } : undefined}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper to get icon component by name
export function getHabitIcon(name: string): LucideIcon {
  return HABIT_LINE_ICONS.find(i => i.name === name)?.icon || CheckCircle;
}
