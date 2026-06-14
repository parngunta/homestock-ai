import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useNotificationStore } from '@/stores/notification-store';
import { Avatar } from '@/components/new-ui/avatar';
import {
  Home,
  Package,
  ShoppingCart,
  Bell,
  LogOut,
  Moon,
  Sun,
  Plus,
  Search,
  Utensils,
  CalendarDays,
  BarChart3,
  Users,
  ChevronDown,
  Sparkles,
  ScanBarcode,
  Mic,
  Receipt,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const mainNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/shopping', label: 'Shopping List', icon: ShoppingCart },
  { path: '/meal-ideas', label: 'Meal Ideas', icon: Utensils, beta: true },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/household', label: 'Household', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell, badge: true },
];

const quickActions = [
  { to: '/add?mode=receipt', label: 'Scan Receipt', icon: Receipt, color: 'bg-blue-500' },
  { to: '/add?mode=barcode', label: 'Scan Barcode', icon: ScanBarcode, color: 'bg-violet-500' },
  { to: '/add?mode=voice', label: 'Voice Input', icon: Mic, color: 'bg-amber-500' },
  { to: '/add?mode=manual', label: 'Add Item', icon: Plus, color: 'bg-primary' },
];

export default function NewAppLayout() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('homestock-desktop-sidebar');
    return stored === null ? true : stored === 'true';
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { households, currentHousehold, setCurrentHousehold, fetchHouseholds } = useHouseholdStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

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
    if (!menuOpen && !searchOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'homestock-desktop-sidebar' && e.newValue !== null) {
        setDesktopSidebarOpen(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleDesktopSidebar = () => {
    setDesktopSidebarOpen((open) => {
      const next = !open;
      window.localStorage.setItem('homestock-desktop-sidebar', String(next));
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarWidthClass = desktopSidebarOpen ? 'w-64 xl:w-72' : 'w-0';
  const sidebarTranslateClass = desktopSidebarOpen ? 'translate-x-0' : '-translate-x-full';
  const mainLeftClass = desktopSidebarOpen ? 'lg:pl-64 xl:pl-72' : 'lg:pl-0';
  const topBarLeftClass = desktopSidebarOpen ? 'left-64 xl:left-72' : 'left-0';
  const sidebarWidth = desktopSidebarOpen ? '18rem' : '0px';

  return (
    <div className="min-h-screen bg-background text-foreground safe-bottom tap-highlight-transparent">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 ${sidebarWidthClass} flex-col bg-card border-r border-border/40 z-40 overflow-x-hidden transition-all duration-300 ease-out ${sidebarTranslateClass}`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-green flex items-center justify-center shadow-glow">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">HomeStock</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2 space-y-6" aria-label="Primary navigation">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.beta && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">Beta</span>}
                    {item.badge && unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div>
            <p className="px-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg ${action.color} text-white flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border/40">
          <div className="bg-secondary rounded-3xl p-4 text-secondary-foreground shadow-soft">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="font-bold text-sm">AI Assistant</p>
                <p className="text-muted-foreground text-xs">Ask anything about your home</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/ai-chat')}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-white/80 transition-colors text-sm font-semibold text-foreground shadow-soft border border-border/40"
            >
              Start Chat
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-border/40">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-secondary/60 transition-colors text-left"
          >
            <Avatar name={user?.name || '?'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 safe-top bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-5 h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl gradient-green flex items-center justify-center shadow-glow">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">HomeStock</span>
          </Link>

          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setSearchOpen(true)}
              className="w-11 h-11 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <motion.div whileTap={{ scale: 0.92 }}>
              <Link
                to="/notifications"
                className="relative w-11 h-11 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                )}
              </Link>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuOpen(true)}
              className="w-11 h-11 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile menu"
            >
              <Avatar name={user?.name || '?'} size="sm" />
            </motion.button>
          </div>
        </div>

        {households.length > 0 && (
          <div className="px-5 pb-3">
            <label htmlFor="household-switcher-mobile" className="sr-only">Select household</label>
            <div className="relative">
              <select
                id="household-switcher-mobile"
                value={currentHousehold?.id || ''}
                onChange={(e) => setCurrentHousehold(e.target.value)}
                className="w-full text-sm bg-secondary/60 border border-border/50 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
      </header>

      {/* Desktop Top Bar */}
      <div className={`hidden lg:flex fixed top-0 ${topBarLeftClass} right-0 h-20 items-center justify-between px-8 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300 ease-out`}>
        <div className="flex items-center gap-3">
          {households.length > 0 && (
            <div className="relative">
              <label htmlFor="household-switcher-desktop" className="sr-only">Select household</label>
              <select
                id="household-switcher-desktop"
                value={currentHousehold?.id || ''}
                onChange={(e) => setCurrentHousehold(e.target.value)}
                className="h-11 pl-4 pr-10 text-sm font-medium bg-secondary/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 h-11 px-4 rounded-2xl bg-secondary/60 border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="w-4 h-4" />
            <span className="hidden xl:inline">Search anything...</span>
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground/60 border border-border/50 rounded-md px-1.5 py-0.5">
              <span className="text-[10px]">⌘</span>K
            </span>
          </button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsDark(!isDark)}
            className="w-11 h-11 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          <motion.div whileTap={{ scale: 0.92 }}>
            <Link
              to="/notifications"
              className="relative w-11 h-11 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
              )}
            </Link>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMenuOpen(true)}
            className="w-11 h-11 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open profile menu"
          >
            <Avatar name={user?.name || '?'} size="sm" />
          </motion.button>
        </div>
      </div>

      {/* Sidebar toggle rail */}
      <div
        className="hidden lg:flex fixed top-0 bottom-0 z-50 transition-all duration-300 ease-out"
        style={{ left: sidebarWidth, transform: desktopSidebarOpen ? 'translateX(-100%)' : 'translateX(0)' }}
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleDesktopSidebar}
          className="w-5 h-full flex items-center justify-center bg-card/80 hover:bg-card border-r border-border/40 text-muted-foreground hover:text-foreground backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {desktopSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Main Content */}
      <main className={`${mainLeftClass} lg:pt-20 pb-24 lg:pb-8 min-h-screen transition-all duration-300 ease-out`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom bg-background/95 backdrop-blur-xl border-t border-border/40" aria-label="Primary navigation">
        <div className="flex items-end justify-around h-[72px] px-2 pb-2">
          {[
            { path: '/', label: 'Home', icon: Home },
            { path: '/inventory', label: 'Inventory', icon: Package },
            { path: 'add-center', label: 'Add', icon: Plus, center: true },
            { path: '/shopping', label: 'Shopping', icon: ShoppingCart },
            { path: '/profile', label: 'Profile', icon: null },
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path) || (item.center && location.pathname === '/add');
            if (item.path === '/profile') {
              return (
                <button
                  key={item.path}
                  onClick={() => setMenuOpen(true)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-colors duration-200 min-w-[56px] min-h-[48px] ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Avatar name={user?.name || '?'} size="sm" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            }
            if (item.center && Icon) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate('/add')}
                  className="flex flex-col items-center justify-center -mt-5"
                  aria-label="Add item"
                >
                  <div className={`w-14 h-14 rounded-full gradient-green text-white shadow-float flex items-center justify-center ${active ? 'ring-4 ring-primary/20' : ''}`}>
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-semibold mt-1 text-primary">{item.label}</span>
                </button>
              );
            }
            return Icon ? (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-colors duration-200 min-w-[56px] min-h-[48px] ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="text-[11px] font-semibold">{item.label}</span>
              </Link>
            ) : null;
          })}
        </div>
      </nav>

      {/* Mobile FAB alternative (following AGENTS.md convention) - hidden on mobile because sample uses centered tab; keep for tablet/sm screens? */}
      <div className="hidden">
        {/* Reserved for future FAB behavior if needed. The sample mobile uses a centered Add tab, so we align with that. */}
      </div>

      {/* Profile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Profile menu"
              className="absolute right-4 top-[72px] lg:top-4 lg:right-4 w-64 bg-card rounded-3xl shadow-float border border-border/40 p-4"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                <Avatar name={user?.name || '?'} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold text-base truncate">{user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <div className="pt-3 space-y-1">
                <button
                  onClick={() => { setIsDark(!isDark); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-secondary transition-colors text-sm font-medium"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {isDark ? 'Light mode' : 'Dark mode'}
                </button>

                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-destructive/10 text-destructive transition-colors text-sm font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 lg:pt-32 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-xl mx-4 bg-card rounded-3xl shadow-float border border-border/40 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search items, categories, members..."
                  className="flex-1 bg-transparent outline-none text-base"
                />
                <button onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.to}
                        onClick={() => { navigate(action.to); setSearchOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg ${action.color} text-white flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
