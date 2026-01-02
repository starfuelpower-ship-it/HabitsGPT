import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Button } from '@/components/ui/button';
import { ThemePicker } from '@/components/ThemePicker';
import { AmbientSettings } from '@/components/AmbientSettings';
import { CompanionSettings } from '@/components/CompanionSettings';
import { MusicSettings } from '@/components/MusicSettings';
import { NotificationSettings } from '@/components/NotificationSettings';
import { AchievementsUI } from '@/components/AchievementsUI';
import { ArrowLeft, Crown, LogOut, User, ChevronRight, Sparkles, BarChart3, LayoutGrid, Coffee, Cat, Music, Bell, Trophy, MessageCircle, Mail, HelpCircle, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTutorial } from '@/components/AppTutorial';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();
  const { resetTutorial } = useTutorial();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      
      if (error) {
        throw error;
      }
      
      // Sign out locally after successful deletion
      await signOut();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSendFeedback = () => {
    const email = 'feedback@cozyhabits.app';
    const subject = encodeURIComponent('Cozy Habits Feedback');
    const body = encodeURIComponent('Hi Cozy Habits team,\n\nI wanted to share some feedback:\n\n');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Premium Banner */}
          {!isPremium && (
            <button
              onClick={() => navigate('/premium')}
              className="w-full bg-gradient-to-r from-primary/20 to-accent rounded-2xl p-4 border border-primary/30 text-left transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Go Premium</h3>
                    <p className="text-sm text-muted-foreground">Unlock all features</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          )}

          {isPremium && (
            <div className="bg-gradient-to-r from-primary/20 to-accent rounded-2xl p-4 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Premium Active</h3>
                  <p className="text-sm text-muted-foreground">You have access to all features</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Account</h2>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              {user ? (
                <>
                  <div className="p-4 flex items-center gap-3 border-b border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">Sign Out</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <span className="text-destructive">Delete Account</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">Sign In</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Cozy Atmosphere Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              Cozy Atmosphere
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <AmbientSettings />
            </div>
          </div>

          {/* Background Music Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Background Music
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <MusicSettings />
            </div>
          </div>

          {/* Companion Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Cat className="w-4 h-4" />
              Companion
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <CompanionSettings />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Appearance</h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <ThemePicker />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <NotificationSettings />
            </div>
          </div>

          {/* Achievements Section */}
          {user && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </h2>
              <div className="bg-card rounded-2xl border border-border/50 p-4">
                <AchievementsUI />
              </div>
            </div>
          )}

          {/* Premium Features Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Premium Features</h2>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <button
                onClick={() => isPremium ? navigate('/stats') : navigate('/premium')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Weekly Stats</span>
                </div>
                {!isPremium && <Crown className="w-4 h-4 text-primary" />}
                {isPremium && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>

              <button
                onClick={() => navigate('/widgets')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Home Screen Widgets</span>
                </div>
                {!isPremium && <Crown className="w-4 h-4 text-primary" />}
                {isPremium && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>

              <button
                onClick={() => !isPremium && navigate('/premium')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Unlimited Reminders</span>
                </div>
                {!isPremium && <Crown className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Support</h2>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <button
                onClick={() => {
                  resetTutorial();
                  navigate('/');
                  toast.success('Tutorial restarted!');
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">View App Tutorial</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleSendFeedback}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Send Feedback</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Legal Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Legal</h2>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <button
                onClick={() => navigate('/privacy')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-foreground">Privacy Policy</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate('/terms')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-foreground">Terms of Service</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">Cozy Habits v1.0.0 (Build 1)</p>
            <p className="text-xs text-muted-foreground mt-1">Made with 💚 for habit builders</p>
          </div>
        </div>
      </div>
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data including habits, progress, points, and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
