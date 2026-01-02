import { format, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

// ============================================
// DAY SELECTOR
// ============================================
// Horizontal scrollable day selector showing last 7 days
// Customize: Change daysToShow to show more/fewer days

interface DaySelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysToShow?: number;
}

export function DaySelector({
  selectedDate,
  onSelectDate,
  daysToShow = 7,
}: DaySelectorProps) {
  const today = new Date();
  const days = Array.from({ length: daysToShow }, (_, i) =>
    subDays(today, daysToShow - 1 - i)
  );

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={cn(
              'flex flex-col items-center min-w-[48px] py-2 px-3 rounded-2xl transition-all duration-200',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'bg-card hover:bg-muted'
            )}
          >
            <span
              className={cn(
                'text-xs font-medium uppercase',
                isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}
            >
              {format(day, 'EEE')}
            </span>
            <span
              className={cn(
                'text-lg font-semibold mt-0.5',
                isSelected ? 'text-primary-foreground' : 'text-foreground'
              )}
            >
              {format(day, 'd')}
            </span>
            {isToday && !isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
