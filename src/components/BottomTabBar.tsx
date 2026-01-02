import { Home, BarChart3, Users, BookOpen, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ============================================
// BOTTOM TAB BAR
// ============================================
// Customize: Add or remove tabs by modifying the tabs array
// Customize: Change icons by importing different Lucide icons

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'stats', label: 'Stats', icon: BarChart3, path: '/stats' },
  { id: 'groups', label: 'Groups', icon: Users, path: '/groups' },
  { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="tab-bar safe-bottom">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
