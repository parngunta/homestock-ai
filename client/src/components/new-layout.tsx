import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useNotificationStore } from '@/stores/notification-store';
import { Avatar } from '@/components/new-ui/avatar';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Plus,
  Bell,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/add', label: 'Add', icon: Plus, center: true },
  { path: '/shopping', label: 'Shopping', icon: ShoppingCart },
  { path: '/household', label: 'Household', icon: Users },
];

export default function NewAppLayout() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { households, currentHousehold, setCurrentHousehold, fetchHouseholds } = useHouseholdStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const location = useLocation();

  useEffect(() => {
    fetchHouseholds();
  }, []);

  useEffect(() => {
    if (currentHousehold) fetchNotifications(currentHousehold.id);
  }, [currentHousehold?.id]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [menuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground safe-bottom tap-highlight-transparent">
      <header className="sticky top-0 z-30 safe-top bg-background border-b border-border">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">HomeStock</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-11 h-11 rounded-full hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/notifications"
              className="relative w-11 h-11 rounded-full hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="w-11 h-11 rounded-full hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile menu"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <Avatar name={user?.name || '?'} size="sm" />
            </button>
          </div>
        </div>

        {households.length > 0 && (
          <div className="px-5 pb-3">
            <label htmlFor="household-switcher" className="sr-only">Select household</label>
            <select
              id="household-switcher"
              value={currentHousehold?.id || ''}
              onChange={(e) => setCurrentHousehold(e.target.value)}
              className="w-full text-sm bg-secondary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      <main className="pb-28">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom bg-background border-t border-border" aria-label="Primary navigation">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors duration-200 min-w-[56px] min-h-[48px] ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.center ? (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                )}
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Profile menu"
            className="absolute right-4 top-16 w-60 bg-card rounded-2xl shadow-float border border-border p-3 animate-fade-in-up"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <Avatar name={user?.name || '?'} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <button
                onClick={() => { setIsDark(!isDark); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>

              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
