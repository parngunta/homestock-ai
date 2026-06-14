import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useHouseholdStore } from '@/stores/household-store';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/new-ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/new-ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/new-ui/sheet';
import { EmptyState } from '@/components/new-ui/empty-state';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  Check,
  User,
  Mic,
  Receipt,
  Send,
  Camera as CameraIcon,
  ScanBarcode,
  Box,
  Calendar,
  ArrowRight,
  LayoutGrid,
  ChefHat,
} from 'lucide-react';
import type { DashboardData, InventoryItem, Prediction } from '@/types';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
};

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  let text = '';
  if (hour < 12) text = 'Good morning';
  else if (hour < 18) text = 'Good afternoon';
  else text = 'Good evening';
  return name ? `${text}, ${name.split(' ')[0]}` : text;
}

function getItemEmoji(name: string, category?: string): string {
  const map: Record<string, string> = {
    toilet: '🧻', paper: '🧻', cat: '🐱', food: '🐱', dog: '🐶', pet: '🐾',
    milk: '🥛', egg: '🥚', bread: '🍞', cheese: '🧀', butter: '🧈', yogurt: '🥣',
    fruit: '🍎', apple: '🍎', banana: '🍌', orange: '🍊', vegetable: '🥬',
    coffee: '☕', tea: '🍵', water: '💧', juice: '🧃', soda: '🥤',
    detergent: '🧼', soap: '🧼', shampoo: '🧴', conditioner: '🧴', laundry: '🧺',
    medicine: '💊', pill: '💊', vitamin: '💊', bandage: '🩹',
    rice: '🍚', pasta: '🍝', cereal: '🥣', oil: '🫒', sugar: '🍬', salt: '🧂',
    chicken: '🍗', beef: '🥩', fish: '🐟', shrimp: '🦐',
    diaper: '🍼', baby: '🍼', wipe: '🧻',
    battery: '🔋', light: '💡', bulb: '💡', bag: '🛍️', trash: '🗑️',
  };
  const key = Object.keys(map).find((k) => name.toLowerCase().includes(k) || category?.toLowerCase().includes(k));
  return key ? map[key] : '📦';
}

const categoryColorMap: Record<string, string> = {
  Food: 'bg-red-50 text-red-600',
  Beverage: 'bg-orange-50 text-orange-600',
  Cleaning: 'bg-blue-50 text-blue-600',
  Laundry: 'bg-sky-50 text-sky-600',
  Bathroom: 'bg-cyan-50 text-cyan-600',
  Pet: 'bg-amber-50 text-amber-600',
  Kitchen: 'bg-violet-50 text-violet-600',
  Medicine: 'bg-rose-50 text-rose-600',
  Other: 'bg-gray-100 text-gray-600',
  Pantry: 'bg-emerald-50 text-emerald-600',
  BATHROOM: 'bg-cyan-50 text-cyan-600',
  BEVERAGE: 'bg-orange-50 text-orange-600',
  PET: 'bg-amber-50 text-amber-600',
  FOOD: 'bg-red-50 text-red-600',
  CLEANING: 'bg-blue-50 text-blue-600',
  MEDICINE: 'bg-rose-50 text-rose-600',
  KITCHEN: 'bg-violet-50 text-violet-600',
  LAUNDRY: 'bg-sky-50 text-sky-600',
  OTHER: 'bg-gray-100 text-gray-600',
};

const categoryLucideIcon: Record<string, typeof LayoutGrid> = {
  Pantry: Package,
  Beverages: LayoutGrid,
  Dairy: LayoutGrid,
  Snacks: LayoutGrid,
  Household: LayoutGrid,
  'Personal Care': LayoutGrid,
  'Pet Supplies': LayoutGrid,
  Others: LayoutGrid,
  BATHROOM: LayoutGrid,
  BEVERAGE: LayoutGrid,
  PET: LayoutGrid,
  FOOD: Package,
  CLEANING: LayoutGrid,
  MEDICINE: LayoutGrid,
  KITCHEN: LayoutGrid,
  LAUNDRY: LayoutGrid,
  OTHER: LayoutGrid,
};

export default function NewDashboardPage() {
  const { currentHousehold } = useHouseholdStore();
  const { user } = useAuthStore();

  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard', currentHousehold?.id],
    queryFn: async () => {
      const res = await api.get(`/dashboard/${currentHousehold!.id}`);
      return res.data;
    },
    enabled: !!currentHousehold,
    refetchInterval: 30000,
  });

  if (!currentHousehold) {
    return (
      <EmptyState
        icon={Package}
        title="No household yet"
        description="Create a household to start tracking supplies together."
      >
        <Link to="/household">
          <Button size="lg" className="rounded-full px-6">Create Household</Button>
        </Link>
      </EmptyState>
    );
  }

  const greeting = getGreeting(user?.name);

  return (
    <motion.div
      className="px-5 lg:px-8 pt-6 pb-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.section variants={itemVariants}>
        <p className="text-sm text-muted-foreground mb-1">{greeting} 👋</p>
        <h1 className="text-hero text-foreground">Your home looks great today.</h1>
      </motion.section>

      {/* Stats cards */}
      <motion.section variants={itemVariants}>
        <StatsCards dashboard={dashboard} />
      </motion.section>

      {/* Attention / Shopping + AI split row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Attention card spans full height of the right column */}
        <AttentionSection dashboard={dashboard} />

        <div className="flex flex-col gap-6">
          {/* Shopping preview */}
          <ShoppingPreview dashboard={dashboard} />

          {/* AI Assistant */}
          <AIAssistantCard />
        </div>
      </div>

      {/* Quick actions full-width row */}
      <QuickActions />

      {/* Bottom sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <CategoryInventory dashboard={dashboard} />
        <RecentActivity dashboard={dashboard} />
        <ExpiringSoon dashboard={dashboard} />
      </div>
    </motion.div>
  );
}

function StatsCards({ dashboard }: { dashboard?: DashboardData }) {
  const totalItems = dashboard?.totalItems ?? 0;
  const runningLow = dashboard?.lowStockItems.length ?? 0;
  const expiringSoon = dashboard?.expiringSoon.length ?? 0;
  const shoppingCount = dashboard?.shoppingItems.length ?? 0;

  const cards = [
    { label: 'Total Items', value: totalItems, sub: '+12 this week', icon: Box, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Running Low', value: runningLow, sub: 'Needs attention', icon: AlertTriangle, bg: 'bg-amber-100', text: 'text-amber-600' },
    { label: 'Expiring Soon', value: expiringSoon, sub: 'Within 3 days', icon: Calendar, bg: 'bg-orange-100', text: 'text-orange-600' },
    { label: 'Shopping List', value: shoppingCount, sub: 'Items to buy', icon: ShoppingCart, bg: 'bg-violet-100', text: 'text-violet-600' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="border-border/40">
            <CardContent className="p-4 lg:p-5 flex items-start gap-3 lg:gap-4">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${card.text}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{card.value}</p>
                <p className={`text-xs mt-0.5 ${idx === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{card.sub}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AttentionSection({ dashboard }: { dashboard?: DashboardData }) {
  const navigate = useNavigate();

  const items: {
    id: string;
    name: string;
    detail: string;
    type: 'urgent' | 'warning' | 'info';
    category?: string;
  }[] = [];

  dashboard?.outOfStockItems.forEach((item: InventoryItem) => {
    items.push({ id: item.id, name: item.name, detail: 'Out of stock', type: 'urgent', category: item.category });
  });

  dashboard?.lowStockItems.forEach((item: InventoryItem) => {
    items.push({ id: item.id, name: item.name, detail: `Only ${item.quantity} left`, type: 'warning', category: item.category });
  });

  dashboard?.expiringSoon.forEach((item: InventoryItem) => {
    const days = item.expiryDate
      ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    items.push({
      id: item.id,
      name: item.name,
      detail: days <= 0 ? 'Expires today' : days === 1 ? 'Expires tomorrow' : `Expires in ${days} days`,
      type: 'urgent',
      category: item.category,
    });
  });

  dashboard?.predictedOutSoon.forEach((item: Prediction) => {
    const days = item.remainingDays ? Math.round(item.remainingDays) : 0;
    items.push({
      id: item.itemId,
      name: item.name,
      detail: days > 0 ? `${days} days left` : 'Running low',
      type: 'info',
    });
  });

  if (items.length === 0) return null;

  return (
    <motion.section variants={itemVariants} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-title">Items to Take Action</h2>
        <Link to="/shopping" className="text-sm text-primary font-semibold flex items-center gap-0.5">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <Card className="border-border/40 overflow-hidden flex-1">
        <CardContent className="p-0 h-full">
          <div className="divide-y divide-border/50">
            {items.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/inventory/${item.id}`)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                    {getItemEmoji(item.name, item.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot type={item.type} />
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

function StatusDot({ type }: { type: 'urgent' | 'warning' | 'info' }) {
  const colors = { urgent: 'bg-destructive', warning: 'bg-warning', info: 'bg-primary' };
  const labels = { urgent: 'Urgent', warning: 'Low', info: 'Soon' };
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground whitespace-nowrap">
      <span className={`w-2 h-2 rounded-full ${colors[type]}`} />
      {labels[type]}
    </div>
  );
}

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { icon: Receipt, label: 'Scan Receipt', color: 'bg-blue-500', to: '/add?mode=receipt' },
    { icon: ScanBarcode, label: 'Scan Barcode', color: 'bg-violet-500', to: '/add?mode=barcode' },
    { icon: Mic, label: 'Voice', color: 'bg-amber-500', to: '/add?mode=voice' },
    { icon: Plus, label: 'Add', color: 'bg-primary', to: '/add?mode=manual' },
  ];

  return (
    <motion.section variants={itemVariants}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-title">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/40 shadow-soft text-center transition-shadow hover:shadow-card"
          >
            <div className={`w-11 h-11 rounded-full ${action.color} text-white flex items-center justify-center shrink-0`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xs leading-tight">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}

function AIAssistantCard() {
  const { currentHousehold } = useHouseholdStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!currentHousehold) return null;

  const suggestions = [
    { label: "What's running low?", icon: AlertTriangle },
    { label: 'What expires soon?', icon: Clock },
    { label: 'Meal Ideas with my ingredients', icon: ChefHat },
  ];

  const handleSend = async (message?: string) => {
    const msg = message || input.trim();
    if (!msg || !currentHousehold) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post(`/ai/${currentHousehold.id}/chat`, { message: msg });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I’m having trouble connecting. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button className="w-full group text-left" variants={itemVariants}>
          <Card className="overflow-hidden border-0 shadow-glow gradient-green text-white">
            <CardContent className="p-5 lg:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold mb-0.5">Ask HomeStock AI</p>
                  <p className="text-white/80 text-sm">Get smart suggestions for your home</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 mb-4">
                <input
                  readOnly
                  placeholder="What should I buy this week?"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <span key={s.label} className="px-3 py-1.5 rounded-full bg-white/20 text-xs font-medium text-white">
                    {s.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.button>
      </SheetTrigger>
      <SheetContent className="px-0 pb-0">
        <SheetHeader className="px-5">
          <SheetTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-2xl gradient-green flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            HomeStock AI
          </SheetTitle>
          <SheetDescription className="text-base">Ask about your household inventory and shopping list.</SheetDescription>
        </SheetHeader>

        <div className="px-5 py-4 space-y-4 h-[52vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {suggestions.map((s) => (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(s.label)}
                  disabled={isLoading}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-secondary/50 text-left text-base hover:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  {s.label}
                </motion.button>
              ))}
              <div className="flex gap-3 mt-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary/50 text-base font-semibold hover:bg-secondary transition-colors">
                  <Mic className="w-5 h-5" /> Voice
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary/50 text-base font-semibold hover:bg-secondary transition-colors">
                  <CameraIcon className="w-5 h-5" /> Camera
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl gradient-green flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-base ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-green flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-base text-muted-foreground">
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask HomeStock..."
              disabled={isLoading}
              className="flex-1 h-12 rounded-full border border-input bg-background px-5 text-base focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="rounded-full w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShoppingPreview({ dashboard }: { dashboard?: DashboardData }) {
  const navigate = useNavigate();

  return (
    <motion.section variants={itemVariants}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-title">Shopping List</h2>
        <Link to="/shopping" className="text-sm text-primary font-semibold flex items-center gap-0.5">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {dashboard?.shoppingItems && dashboard.shoppingItems.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-col md:gap-3 md:overflow-visible">
          {dashboard.shoppingItems.slice(0, 6).map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/shopping')}
              className="min-w-[140px] md:min-w-0 flex-1 bg-card border border-border/40 rounded-3xl p-4 shadow-soft text-left transition-shadow hover:shadow-card"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl mb-3">
                {getItemEmoji(item.name)}
              </div>
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{mapCategory(item.name)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.quantity} {item.unit.toLowerCase()}
              </p>
            </motion.button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="No pending items"
          description="Your shopping list is empty. Add items that need restocking."
        >
          <Link to="/shopping">
            <Button size="sm" variant="outline" className="rounded-full">Add item</Button>
          </Link>
        </EmptyState>
      )}
    </motion.section>
  );
}

function CategoryInventory({ dashboard }: { dashboard?: DashboardData }) {
  const counts = dashboard?.categoryCounts ?? [];
  const categories = counts.length > 0 ? counts : [
    { category: 'Pantry', _count: 32 },
    { category: 'Beverages', _count: 15 },
    { category: 'Dairy', _count: 12 },
    { category: 'Snacks', _count: 10 },
    { category: 'Household', _count: 20 },
    { category: 'Personal Care', _count: 8 },
    { category: 'Pet Supplies', _count: 7 },
    { category: 'Others', _count: 24 },
  ];

  return (
    <motion.section variants={itemVariants}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <h2 className="text-card-title">Inventory by Category</h2>
        <Link to="/inventory" className="text-sm text-primary font-semibold flex items-center gap-0.5 shrink-0">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const Icon = categoryLucideIcon[cat.category] || LayoutGrid;
              return (
                <Link
                  key={cat.category}
                  to="/inventory"
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-secondary/40 hover:bg-secondary transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${categoryColorMap[cat.category] || 'bg-secondary text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate">{cat.category}</p>
                    <p className="text-[10px] text-muted-foreground">{cat._count} items</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

function RecentActivity({ dashboard }: { dashboard?: DashboardData }) {
  return (
    <motion.section variants={itemVariants}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <h2 className="text-card-title">Recent Activity</h2>
        <Link to="/household" className="text-sm text-primary font-semibold flex items-center gap-0.5 shrink-0">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="p-5 space-y-4">
          {dashboard?.recentActivity?.length ? (
            dashboard.recentActivity.slice(0, 5).map((activity) => (
              <ActivityRow
                key={activity.id}
                name={activity.user?.name || 'HomeStock'}
                action={activity.message}
                icon={activityIcon(activity.type)}
                color={activityColor(activity.type)}
                time={activity.createdAt}
                avatarUrl={activity.user?.avatarUrl}
              />
            ))
          ) : (
            <p className="text-base text-muted-foreground text-center py-2">
              Activity will appear here as your household uses items.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}

function ExpiringSoon({ dashboard }: { dashboard?: DashboardData }) {
  const navigate = useNavigate();
  const items = dashboard?.expiringSoon.slice(0, 4) ?? [];

  return (
    <motion.section variants={itemVariants}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <h2 className="text-card-title">Expiring Soon</h2>
        <Link to="/inventory" className="text-sm text-primary font-semibold flex items-center gap-0.5 shrink-0">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="p-0">
          {items.length > 0 ? (
            <div className="divide-y divide-border/50">
              {items.map((item) => {
                const days = item.expiryDate
                  ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : 0;
                const label = days <= 0 ? 'Expires tomorrow' : `Expires in ${days} days`;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                        {getItemEmoji(item.name, item.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} {item.unit.toLowerCase()} left</p>
                      </div>
                    </div>
                    <Badge variant={days <= 1 ? 'danger' : 'warning'} size="sm">{label}</Badge>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No items expiring soon.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}

function mapCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('banana') || lower.includes('fruit')) return 'Fruits';
  if (lower.includes('chicken') || lower.includes('meat')) return 'Meat';
  if (lower.includes('detergent') || lower.includes('laundry')) return 'Household';
  if (lower.includes('tomato') || lower.includes('vegetable')) return 'Vegetables';
  if (lower.includes('bread') || lower.includes('bakery')) return 'Bakery';
  if (lower.includes('yogurt') || lower.includes('milk') || lower.includes('dairy')) return 'Dairy';
  if (lower.includes('oil')) return 'Pantry';
  if (lower.includes('sugar')) return 'Pantry';
  return 'Pantry';
}

function ActivityRow({
  name,
  action,
  icon: Icon,
  color,
  time,
  avatarUrl,
}: {
  name: string;
  action: string;
  icon: typeof Clock;
  color: string;
  time?: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-2xl object-cover shrink-0" />
      ) : (
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-base">
          <span className="font-semibold">{name}</span>{' '}
          <span className="text-muted-foreground">{action}</span>
        </p>
        {time && (
          <p className="text-sm text-muted-foreground/70">{formatActivityTime(time)}</p>
        )}
      </div>
    </div>
  );
}

function formatActivityTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function priorityToBadge(priority: string): 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'ghost' {
  switch (priority) {
    case 'LOW': return 'default';
    case 'MEDIUM': return 'primary';
    case 'HIGH': return 'warning';
    case 'URGENT': return 'danger';
    default: return 'default';
  }
}

priorityToBadge;

function activityIcon(type: string): typeof Clock {
  if (type.includes('SHOPPING')) return ShoppingCart;
  if (type.includes('MEMBER')) return User;
  if (type.includes('HOUSEHOLD')) return Check;
  if (type.includes('ARCHIVED')) return Package;
  if (type.includes('ADJUSTED')) return Plus;
  if (type.includes('ALERT')) return AlertTriangle;
  return Package;
}

function activityColor(type: string): string {
  if (type.includes('PURCHASED')) return 'bg-emerald-100 text-emerald-700';
  if (type.includes('ALERT')) return 'bg-red-100 text-red-700';
  if (type.includes('MEMBER')) return 'bg-violet-100 text-violet-700';
  if (type.includes('SHOPPING')) return 'bg-blue-100 text-blue-700';
  return 'bg-secondary text-muted-foreground';
}
