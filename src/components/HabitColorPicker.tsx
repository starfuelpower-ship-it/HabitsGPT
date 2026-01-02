import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Crown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

// ============================================
// HABIT COLOR PICKER
// ============================================
// Color selection for habit customization

export interface HabitColorOption {
  name: string;
  value: string;
  isPremium?: boolean;
}

export const HABIT_COLORS: HabitColorOption[] = [
  { name: 'Default', value: '' },
  { name: 'Rose', value: 'hsl(350, 70%, 55%)' },
  { name: 'Coral', value: 'hsl(15, 80%, 55%)' },
  { name: 'Orange', value: 'hsl(30, 85%, 50%)' },
  { name: 'Amber', value: 'hsl(45, 90%, 48%)' },
  { name: 'Lime', value: 'hsl(80, 70%, 45%)' },
  { name: 'Green', value: 'hsl(140, 60%, 45%)' },
  { name: 'Teal', value: 'hsl(170, 65%, 42%)' },
  { name: 'Cyan', value: 'hsl(190, 75%, 45%)' },
  { name: 'Sky', value: 'hsl(200, 80%, 55%)' },
  { name: 'Blue', value: 'hsl(220, 75%, 55%)' },
  { name: 'Indigo', value: 'hsl(240, 60%, 55%)' },
  { name: 'Purple', value: 'hsl(270, 65%, 55%)' },
  { name: 'Violet', value: 'hsl(290, 60%, 55%)' },
  { name: 'Pink', value: 'hsl(330, 70%, 55%)' },
];

interface HabitColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  isPremium?: boolean;
  showPremiumLock?: boolean;
}

export function HabitColorPicker({ 
  value, 
  onChange, 
  isPremium = true,
  showPremiumLock = false,
}: HabitColorPickerProps) {
  const [open, setOpen] = useState(false);
  
  const selectedColor = HABIT_COLORS.find(c => c.value === value) || HABIT_COLORS[0];
  const displayColor = value || 'hsl(var(--primary))';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-14 h-14 rounded-xl p-0 flex items-center justify-center relative overflow-hidden"
        >
          <div 
            className="w-8 h-8 rounded-full shadow-inner"
            style={{ backgroundColor: displayColor }}
          />
          {showPremiumLock && !isPremium && value && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-card border-border z-50" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Choose a color</p>
            {showPremiumLock && !isPremium && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Crown className="w-3 h-3 text-primary" />
                Premium
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {HABIT_COLORS.map(({ name, value: colorValue }) => {
              const isSelected = value === colorValue;
              const isLocked = showPremiumLock && !isPremium && colorValue !== '';
              const bgColor = colorValue || 'hsl(var(--primary))';
              
              return (
                <button
                  key={name}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    onChange(colorValue);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    'border-2 hover:scale-110',
                    isSelected ? 'border-foreground shadow-md scale-110' : 'border-transparent',
                    isLocked && 'opacity-40 cursor-not-allowed hover:scale-100'
                  )}
                  style={{ backgroundColor: bgColor }}
                  title={name}
                >
                  {isSelected && (
                    <Check 
                      className="w-4 h-4" 
                      style={{ color: colorValue ? 'white' : 'hsl(var(--primary-foreground))' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
