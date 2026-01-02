import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompanion } from '@/contexts/CompanionContext';
import { usePoints, POINTS } from '@/contexts/PointsContext';
import { useCloudHabits, CloudHabit } from '@/hooks/useCloudHabits';
import { useHabits } from '@/hooks/useHabits';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useAchievements } from '@/hooks/useAchievements';
import { useAmbient } from '@/contexts/AmbientContext';
import { CloudHabitCard } from '@/components/CloudHabitCard';
import { HabitCard } from '@/components/HabitCard';
import { ProgressRing } from '@/components/ProgressRing';
import { PlantGrowth } from '@/components/PlantGrowth';
import { DaySelector } from '@/components/DaySelector';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EditHabitDialog } from '@/components/EditHabitDialog';
import { HabitIntentionCompleteDialog } from '@/components/HabitIntentionCompleteDialog';
import { EmptyState } from '@/components/EmptyState';
import { BottomTabBar } from '@/components/BottomTabBar';
import { DailyReflectionModal } from '@/components/DailyReflectionModal';
import { MotivationalMessage } from '@/components/MotivationalMessage';
import { QuoteDisplay } from '@/components/QuoteDisplay';
import { ShareMilestone, useShareMilestone } from '@/components/ShareMilestone';
import { CatCompanionIntro } from '@/components/CatCompanionIntro';
import { PointsDisplay } from '@/components/PointsDisplay';
import { PointsEarnedAnimation } from '@/components/PointsEarnedAnimation';
import { AppTutorial, useTutorial } from '@/components/AppTutorial';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RefreshCw, Settings, User, Cloud, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';

const ONBOARDING_KEY = 'daily-reset-onboarding-complete';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings } = useUserSettings();
  const [editingHabit, setEditingHabit] = useState<CloudHabit | null>(null);
  const [intentionCompleteHabit, setIntentionCompleteHabit] = useState<CloudHabit | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showReflection, setShowReflection] = useState(false);
  const hasShownReflectionToday = useRef(false);
  const intentionCheckedHabits = useRef<Set<string>>(new Set());
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const { shareData, openShare, closeShare, isOpen: isShareOpen } = useShareMilestone();
  const { triggerReaction } = useCompanion();
  const { playSound } = useSoundEffects();
  const { earnPoints, checkDailyBonus, checkWeeklyBonus, currentAnimation, clearAnimation, balance } = usePoints();
  const { showTutorial, completeTutorial } = useTutorial();
  const { trackHabitCompletion, tryRequestReview } = useInAppReview();
  const { checkAndAwardAchievements } = useAchievements();
  const { ambientMode } = useAmbient();
  const dailyBonusChecked = useRef(false);
  const initialLoadComplete = useRef(false);
  const prevCompletedCount = useRef<number | null>(null);

  // User preferences (with defaults for guests)
  const confettiEnabled = settings?.confetti_enabled ?? true;
  const soundEnabled = settings?.sound_enabled ?? true;

  // Cloud habits (for logged-in users)
  const cloudHabits = useCloudHabits();
  
  // Local habits (for guests)
  const localHabits = useHabits();

  // Use cloud or local based on auth status
  const isLoggedIn = !!user;
  const habits = isLoggedIn ? cloudHabits.habits : localHabits.habits;
  const isLoading = authLoading || (isLoggedIn ? cloudHabits.isLoading : localHabits.isLoading);
  const completedCount = isLoggedIn ? cloudHabits.completedCount : localHabits.completedCount;
  const totalCount = isLoggedIn ? cloudHabits.totalCount : localHabits.totalCount;
  const progressPercent = isLoggedIn ? cloudHabits.progressPercent : localHabits.progressPercent;

  // Calculate total completions for plant growth (cumulative progress)
  const totalCompletions = useMemo(() => {
    // Use completed count as a base, in real implementation this would come from database
    // For now, simulate with sum of streaks + today's completions
    const currentHabits = isLoggedIn ? cloudHabits.habits : localHabits.habits;
    if (currentHabits.length === 0) return 0;
    const streakSum = currentHabits.reduce((sum, h) => sum + ((h as any).streak || 0), 0);
    return streakSum + completedCount;
  }, [isLoggedIn, cloudHabits.habits, localHabits.habits, completedCount]);

  // Calculate best streak for display
  const bestStreak = useMemo(() => {
    const currentHabits = isLoggedIn ? cloudHabits.habits : localHabits.habits;
    if (currentHabits.length === 0) return 0;
    return Math.max(...currentHabits.map(h => (h as any).streak || 0), 0);
  }, [isLoggedIn, cloudHabits.habits, localHabits.habits]);

  // Check if new user needs onboarding (guests only - logged in users checked in Onboarding)
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (!hasCompletedOnboarding && !authLoading) {
      // Give a tiny delay to prevent flash
      const timer = setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
    setOnboardingChecked(true);
  }, [authLoading, navigate]);

  // Migrate local habits to cloud after login
  useEffect(() => {
    if (user && !hasMigrated && !cloudHabits.isLoading) {
      const localStorageHabits = localStorage.getItem('daily-reset-habits');
      if (localStorageHabits) {
        const parsed = JSON.parse(localStorageHabits);
        if (parsed.length > 0 && cloudHabits.habits.length === 0) {
          cloudHabits.migrateLocalHabits(parsed);
          setHasMigrated(true);
        }
      }
    }
  }, [user, hasMigrated, cloudHabits.isLoading]);

  // Check for habits with completed intentions
  useEffect(() => {
    if (!isLoggedIn || isLoading || !cloudHabits.checkIntentionComplete) return;
    
    for (const habit of cloudHabits.habits) {
      if (!intentionCheckedHabits.current.has(habit.id) && cloudHabits.checkIntentionComplete(habit)) {
        intentionCheckedHabits.current.add(habit.id);
        setIntentionCompleteHabit(habit);
        break;
      }
    }
  }, [isLoggedIn, isLoading, cloudHabits.habits, cloudHabits.checkIntentionComplete]);

  // Check for daily and weekly bonus on load
  useEffect(() => {
    if (isLoggedIn && !dailyBonusChecked.current && !isLoading) {
      dailyBonusChecked.current = true;
      checkDailyBonus();
      checkWeeklyBonus();
    }
  }, [isLoggedIn, isLoading, checkDailyBonus, checkWeeklyBonus]);

  // Track initial load to prevent bonus on page load with already-completed habits
  useEffect(() => {
    if (!isLoading && !initialLoadComplete.current) {
      // Mark initial load complete after a short delay to let state settle
      const timer = setTimeout(() => {
        initialLoadComplete.current = true;
        prevCompletedCount.current = completedCount;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, completedCount]);

  // Show daily reflection and earn bonus points when all habits are completed
  // Only trigger when user actively completes the last habit, not on initial load
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const reflectionKey = `reflection-shown-${today}`;
    const alreadyShown = localStorage.getItem(reflectionKey) === 'true';
    
    // Only trigger if:
    // 1. Initial load is complete
    // 2. User is logged in
    // 3. There are habits
    // 4. All habits are now complete
    // 5. The completed count actually increased (user just completed something)
    // 6. We haven't shown reflection today
    const completedCountIncreased = prevCompletedCount.current !== null && 
                                     completedCount > prevCompletedCount.current;
    
    if (
      initialLoadComplete.current &&
      isLoggedIn && 
      totalCount > 0 && 
      completedCount === totalCount && 
      completedCountIncreased &&
      !hasShownReflectionToday.current &&
      !alreadyShown &&
      !isLoading
    ) {
      // Earn bonus for completing all habits
      earnPoints(POINTS.ALL_HABITS_COMPLETE, 'all_complete', 'Completed all habits today');
      
      // Small delay to let celebration animation play first
      const timer = setTimeout(() => {
        setShowReflection(true);
        hasShownReflectionToday.current = true;
        localStorage.setItem(reflectionKey, 'true');
      }, 1500);
      
      prevCompletedCount.current = completedCount;
      return () => clearTimeout(timer);
    }
    
    // Update prev count for next comparison
    if (initialLoadComplete.current) {
      prevCompletedCount.current = completedCount;
    }
  }, [completedCount, totalCount, isLoggedIn, isLoading, earnPoints]);

  const handleAddHabit = (name: string, category: string, notes: string, icon?: string, color?: string) => {
    if (isLoggedIn) {
      cloudHabits.addHabit(name, category, notes, icon, color);
    } else {
      localHabits.addHabit(name, category as any, notes);
    }
  };

  const handleToggleHabit = async (id: string) => {
    // Find the habit to check if we're completing it
    const habit = habits.find(h => h.id === id);
    const isCompleting = habit && !(habit as any).completed_today && !(habit as any).completedToday;
    const habitStreak = (habit as any)?.streak || 0;
    
    if (isLoggedIn) {
      cloudHabits.toggleHabit(id);
    } else {
      localHabits.toggleHabit(id);
    }
    
    // Track completion for in-app review and achievements (only when completing)
    if (isCompleting && isLoggedIn) {
      trackHabitCompletion();
      
      // Check achievements with context
      checkAndAwardAchievements({
        habitCompleted: true,
        habitStreak: habitStreak + 1,
        totalHabitsCompleted: completedCount + 1,
        ambientMode: ambientMode || undefined,
        pointsEarned: true,
        pointsBalance: balance,
      });
      
      // Try to request review after tracking (checks criteria internally)
      setTimeout(() => tryRequestReview(), 1000);
    }
  };

  // Check if all habits will be complete after this toggle
  const checkAllComplete = useCallback(() => {
    // After toggling, check if all habits are now completed
    // We need to count current completed + 1 (the one just completed)
    const newCompletedCount = completedCount + 1;
    if (newCompletedCount >= totalCount && totalCount > 0) {
      // Small delay to let the habit completion animation play first
      setTimeout(() => {
        triggerReaction('all_complete');
      }, 500);
    }
  }, [completedCount, totalCount, triggerReaction]);

  const handleDeleteHabit = (id: string) => {
    if (isLoggedIn) {
      cloudHabits.deleteHabit(id);
    } else {
      localHabits.deleteHabit(id);
    }
  };

  const toggleTheme = () => {
    playSound('click');
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSettingsClick = () => {
    playSound('click');
    navigate('/settings');
  };

  const handleAuthClick = () => {
    playSound('click');
    navigate('/auth');
  };

  if (isLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Tutorial overlay */}
      {showTutorial && <AppTutorial onComplete={completeTutorial} />}
      
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-40">
        {/* Header */}
        <header className="flex items-start justify-between mb-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cozy Habits</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Points Display */}
            <PointsDisplay />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSettingsClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuthClick}
                className="text-muted-foreground"
              >
                <User className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Day Selector */}
        <div className="mb-4 -mx-1 animate-fade-in">
          <DaySelector
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Progress Section with Plant */}
        <div className="ios-card p-5 mb-5 animate-slide-up">
          <div className="flex items-start gap-4">
            {/* Plant Growth with full info */}
            <div className="flex-shrink-0">
              <PlantGrowth 
                totalCompletions={totalCompletions} 
                size="sm" 
                showLabel={true}
                showProgress={true}
                onLevelUp={(stage, name) => {
                  playSound('achievement');
                  triggerReaction('all_complete');
                }}
              />
            </div>
            
            {/* Progress and Stats */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Progress Ring */}
                <ProgressRing
                  progress={progressPercent}
                  size={48}
                  strokeWidth={5}
                />
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-base font-semibold text-foreground">
                    {completedCount}/{totalCount} done
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {bestStreak > 0 && (
                  <span className="text-xs text-primary font-medium">
                    🔥 {bestStreak} day best
                  </span>
                )}
                {isLoggedIn && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Cloud className="w-3 h-3" />
                    Synced
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mb-3">
          <MotivationalMessage 
            bestStreak={bestStreak} 
            completedToday={completedCount} 
            totalHabits={totalCount} 
          />
        </div>

        {/* Daily Quote */}
        <div className="mb-5">
          <QuoteDisplay />
        </div>

        {/* Habits List */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Habits</h2>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} done
            </span>
          </div>
          
          {habits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {isLoggedIn ? (
                cloudHabits.habits.map((habit, index) => (
                  <div 
                    key={habit.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CloudHabitCard
                      habit={habit}
                      onToggle={handleToggleHabit}
                      onEdit={setEditingHabit}
                      onShare={(h) => openShare(h.name, h.icon || '✅', h.streak)}
                      index={index}
                      confettiEnabled={confettiEnabled}
                      soundEnabled={soundEnabled}
                      onComplete={checkAllComplete}
                    />
                  </div>
                ))
              ) : (
                localHabits.habits.map((habit, index) => (
                  <div 
                    key={habit.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <HabitCard
                      habit={habit}
                      onToggle={handleToggleHabit}
                      onDelete={handleDeleteHabit}
                      index={index}
                      confettiEnabled={confettiEnabled}
                      soundEnabled={soundEnabled}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Fixed Add Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <AddHabitDialog onAdd={handleAddHabit} />
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar />

      {/* Habit Intention Complete Dialog */}
      {isLoggedIn && (
        <HabitIntentionCompleteDialog
          habit={intentionCompleteHabit}
          open={!!intentionCompleteHabit}
          onOpenChange={(open) => !open && setIntentionCompleteHabit(null)}
          onContinue={cloudHabits.continueHabit}
          onLetRest={cloudHabits.letHabitRest}
          onArchive={cloudHabits.archiveHabit}
        />
      )}

      {/* Edit Dialog */}
      {isLoggedIn && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onUpdate={cloudHabits.updateHabit}
          onDelete={cloudHabits.deleteHabit}
        />
      )}

      {/* Daily Reflection Modal */}
      <DailyReflectionModal
        open={showReflection}
        onOpenChange={setShowReflection}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Share Milestone Modal */}
      {shareData && (
        <ShareMilestone
          habitName={shareData.habitName}
          habitIcon={shareData.habitIcon}
          streak={shareData.streak}
          open={isShareOpen}
          onOpenChange={(open) => !open && closeShare()}
        />
      )}

      {/* Cat Companion Intro */}
      <CatCompanionIntro />

      {/* Points Earned Animation */}
      {currentAnimation && (
        <PointsEarnedAnimation
          key={currentAnimation.id}
          amount={currentAnimation.amount}
          type={currentAnimation.type}
          onComplete={clearAnimation}
        />
      )}
    </div>
    </>
  );
};

export default Index;
