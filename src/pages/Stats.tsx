import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomTabBar } from '@/components/BottomTabBar';
import { PremiumLock } from '@/components/PremiumLock';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flame, TrendingUp, Calendar, Trophy, Target, 
  CheckCircle, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface DayStats {
  date: string;
  day: string;
  completed: number;
  total: number;
  percentage: number;
}

interface HabitWithStreak {
  id: string;
  name: string;
  streak: number;
  icon: string | null;
  color: string | null;
}

export default function Stats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);
  const [habits, setHabits] = useState<HabitWithStreak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate date ranges
  const dateRange = useMemo(() => {
    if (period === 'week') {
      const baseDate = subWeeks(new Date(), weekOffset);
      const start = startOfWeek(baseDate, { weekStartsOn: 1 });
      const end = endOfWeek(baseDate, { weekStartsOn: 1 });
      return { start, end, label: `${format(start, 'MMM d')} - ${format(end, 'MMM d')}` };
    } else {
      const baseDate = subMonths(new Date(), monthOffset);
      const start = startOfMonth(baseDate);
      const end = endOfMonth(baseDate);
      return { start, end, label: format(baseDate, 'MMMM yyyy') };
    }
  }, [period, weekOffset, monthOffset]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, dateRange]);

  const fetchStats = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');
      
      // Fetch habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('id, name, streak, icon, color')
        .eq('user_id', user.id)
        .eq('archived', false);

      setHabits(habitsData || []);
      const totalHabits = habitsData?.length || 0;

      // Fetch completions for date range
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('completed_at, habit_id')
        .eq('user_id', user.id)
        .gte('completed_at', startStr)
        .lte('completed_at', endStr);

      // Generate daily stats
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      const stats: DayStats[] = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayCompletions = completions?.filter(c => c.completed_at === dateStr).length || 0;
        const percentage = totalHabits > 0 ? Math.round((dayCompletions / totalHabits) * 100) : 0;
        
        return {
          date: dateStr,
          day: period === 'week' ? format(day, 'EEE') : format(day, 'd'),
          completed: dayCompletions,
          total: totalHabits,
          percentage,
        };
      });

      setDailyStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalCompleted = dailyStats.reduce((sum, d) => sum + d.completed, 0);
    const totalPossible = dailyStats.reduce((sum, d) => sum + d.total, 0);
    const avgPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const perfectDays = dailyStats.filter(d => d.percentage === 100).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const currentStreaks = habits.filter(h => h.streak > 0).length;
    
    return { totalCompleted, avgPercentage, perfectDays, bestStreak, currentStreaks };
  }, [dailyStats, habits]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">
            {payload[0].value} {payload[0].dataKey === 'percentage' ? '%' : 'completed'}
          </p>
        </div>
      );
    }
    return null;
  };

  const handlePrevious = () => {
    if (period === 'week') setWeekOffset(prev => prev + 1);
    else setMonthOffset(prev => prev + 1);
  };

  const handleNext = () => {
    if (period === 'week') setWeekOffset(prev => Math.max(0, prev - 1));
    else setMonthOffset(prev => Math.max(0, prev - 1));
  };

  const canGoNext = period === 'week' ? weekOffset > 0 : monthOffset > 0;

  if (premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your habit journey</p>
        </header>

        {/* Period Tabs */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Weekly
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              disabled={!isPremium}
            >
              Monthly {!isPremium && '🔒'}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-card rounded-xl p-3 border border-border/50">
          <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-foreground">{dateRange.label}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext} 
            disabled={!canGoNext}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Completion Rate"
                value={`${summaryStats.avgPercentage}%`}
                color="hsl(var(--primary))"
              />
              <StatCard
                icon={<Flame className="w-4 h-4" />}
                label="Best Streak"
                value={`${summaryStats.bestStreak}`}
                color="hsl(25, 80%, 55%)"
              />
              <StatCard
                icon={<Trophy className="w-4 h-4" />}
                label="Perfect Days"
                value={`${summaryStats.perfectDays}`}
                color="hsl(45, 90%, 50%)"
              />
              <StatCard
                icon={<CheckCircle className="w-4 h-4" />}
                label="Total Done"
                value={`${summaryStats.totalCompleted}`}
                color="hsl(150, 60%, 45%)"
              />
            </div>

            {/* Completion Chart */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Habits Completed</span>
              </div>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats} barCategoryGap="20%">
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar 
                      dataKey="completed" 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={period === 'week' ? 40 : 16}
                    >
                      {dailyStats.map((entry, index) => {
                        const isToday = entry.date === format(new Date(), 'yyyy-MM-dd');
                        return (
                          <Cell 
                            key={`cell-${index}`}
                            fill={isToday ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Completion Rate Trend */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Completion Rate</span>
              </div>
              
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPercentage)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Streaks */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Active Streaks</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {summaryStats.currentStreaks} active
                </span>
              </div>
              
              {habits.filter(h => h.streak > 0).length > 0 ? (
                <div className="space-y-2">
                  {habits
                    .filter(h => h.streak > 0)
                    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
                    .slice(0, 5)
                    .map(habit => (
                      <StreakBar 
                        key={habit.id} 
                        habit={habit} 
                        maxStreak={summaryStats.bestStreak}
                      />
                    ))
                  }
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active streaks yet. Complete a habit to start!
                </p>
              )}
            </div>

            {/* Premium upsell for free users */}
            {!isPremium && (
              <PremiumLock feature="Unlock monthly analytics, detailed reports, and habit insights">
                <div className="bg-card rounded-2xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Monthly Overview</span>
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Monthly charts available with Premium</p>
                  </div>
                </div>
              </PremiumLock>
            )}
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <div style={{ color }}>{icon}</div>
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

// Streak Bar Component
function StreakBar({ habit, maxStreak }: { habit: HabitWithStreak; maxStreak: number }) {
  const percentage = maxStreak > 0 ? ((habit.streak || 0) / maxStreak) * 100 : 0;
  const color = habit.color || 'hsl(var(--primary))';
  
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        {habit.icon ? '🔥' : '🔥'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground truncate">{habit.name}</span>
          <span className="text-xs text-muted-foreground ml-2">{habit.streak} days</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
