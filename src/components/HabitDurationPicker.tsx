import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type HabitDuration = 'today' | 'few_days' | 'week' | 'month' | 'ongoing' | null;

interface HabitDurationPickerProps {
  value: HabitDuration;
  onChange: (value: HabitDuration) => void;
}

const DURATION_OPTIONS: { value: HabitDuration; label: string; description: string }[] = [
  { value: 'ongoing', label: 'Ongoing', description: 'No end in mind' },
  { value: 'today', label: 'Just for today', description: 'Try it once' },
  { value: 'few_days', label: 'A few days', description: '~3 days' },
  { value: 'week', label: 'A week', description: '7 days' },
  { value: 'month', label: 'A month', description: '30 days' },
];

export function HabitDurationPicker({ value, onChange }: HabitDurationPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedOption = DURATION_OPTIONS.find(opt => opt.value === value) || DURATION_OPTIONS[0];

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm text-muted-foreground cursor-pointer">
            How long would you like to try this?
          </Label>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selectedOption.label}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </button>
      
      {isExpanded && (
        <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
          <RadioGroup
            value={value || 'ongoing'}
            onValueChange={(v) => onChange(v as HabitDuration)}
            className="grid grid-cols-1 gap-2"
          >
            {DURATION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                  "hover:bg-accent/50",
                  (value || 'ongoing') === option.value 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-border/50"
                )}
              >
                <RadioGroupItem value={option.value || 'ongoing'} className="sr-only" />
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  (value || 'ongoing') === option.value 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30"
                )}>
                  {(value || 'ongoing') === option.value && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {option.description}
                  </span>
                </div>
              </label>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            This is just an intention — there's no pressure or deadline
          </p>
        </div>
      )}
    </div>
  );
}
