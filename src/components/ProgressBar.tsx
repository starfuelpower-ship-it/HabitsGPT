interface ProgressBarProps {
  completed: number;
  total: number;
  percent: number;
}

export function ProgressBar({ completed, total, percent }: ProgressBarProps) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft-sm border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">Today's Progress</span>
        <span className="text-sm text-muted-foreground">
          {completed} of {total} completed
        </span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      {total > 0 && completed === total && (
        <p className="text-sm text-primary font-medium mt-2 animate-fade-in">
          🎉 All habits completed! Great job!
        </p>
      )}
    </div>
  );
}
