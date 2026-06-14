import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useNotificationStore } from '@/stores/notification-store';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Bell,
  MessageSquare,
  Camera,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/shopping', label: 'Shopping List', icon: ShoppingCart },
  { path: '/household', label: 'Household', icon: Users },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/ai-chat', label: 'AI Assistant', icon: MessageSquare },
  { path: '/receipt', label: 'Receipt Scanner', icon: Camera },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { households, currentHousehold, setCurrentHousehold, fetchHouseholds } = useHouseholdStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const location = useLocation();

  useEffect(() => {
    fetchHouseholds();
  }, []);

  useEffect(() => {
    if (currentHousehold) {
      fetchNotifications(currentHousehold.id);
    }
  }, [currentHousehold?.id]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">HomeStock</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {households.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <select
              value={currentHousehold?.id || ''}
              onChange={(e) => setCurrentHousehold(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center">
          <button className="lg:hidden mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navItems.find((i) => i.path === location.pathname)?.label || 'HomeStock AI'}
          </h1>
        </header>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}