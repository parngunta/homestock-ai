import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useHouseholdStore } from '@/stores/household-store';
import { useAuthStore } from '@/stores/auth-store';
import { useShoppingListStore } from '@/stores/shopping-list-store';
import { Card, CardContent } from '@/components/new-ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/new-ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Check,
  User,
  Mic,
  Camera,
  Send,
} from 'lucide-react';
import type { DashboardData, InventoryItem, Prediction } from '@/types';
import { useState } from 'react';

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  let text = '';
  if (hour < 12) text = 'Good morning';
  else if (hour < 18) text = 'Good afternoon';
  else text = 'Good evening';
  return name ? `${text}, ${name.split(' ')[0]}` : text;
}

function getAttentionCount(dashboard?: DashboardData) {
  if (!dashboard) return 0;
  return (
    dashboard.lowStockItems.length +
    dashboard.outOfStockItems.length +
    dashboard.expiringSoon.length +
    dashboard.predictedOutSoon.length
  );
}

export default function NewDashboardPage() {
  const { currentHousehold } = useHouseholdStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-1">No household yet</h2>
        <p className="text-muted-foreground text-sm mb-5 max-w-sm">
          Create a household to start tracking supplies together.
        </p>
        <Link to="/household">
          <Button size="lg" className="rounded-full px-6">
            Create Household
          </Button>
        </Link>
      </div>
    );
  }

  const attentionCount = getAttentionCount(dashboard);
  const greeting = getGreeting(user?.name);

  return (
    <div className="px-5 pt-6 pb-6 space-y-7">
      {/* Greeting & Attention */}
      <section className="animate-fade-in-up">
        <p className="text-muted-foreground text-sm mb-1">{greeting}</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
              {attentionCount === 0 ? (
                <>Everything looks good</>
              ) : (
                <>
                  {attentionCount} item{attentionCount > 1 ? 's' : ''} need attention
                </>
              )}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {attentionCount === 0
                ? 'Your household is stocked and ready.'
                : 'Review and restock before you run out.'}
            </p>
          </div>
          {attentionCount > 0 && (
            <Button
              onClick={() => navigate('/shopping')}
              size="sm"
              className="rounded-full px-4 shrink-0"
            >
              Review
            </Button>
          )}
        </div>
      </section>

      {/* AI Ask Bar */}
      <section className="animate-fade-in-up stagger-1">
        <AIChatSheet />
      </section>

      {/* Quick Add Chips */}
      <section className="animate-fade-in-up stagger-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <QuickChip icon={Plus} label="Add item" to="/add" color="bg-primary text-primary-foreground" />
          <QuickChip icon={ShoppingCart} label="Shopping" to="/shopping" />
          <QuickChip icon={Package} label="Inventory" to="/inventory" />
          <QuickChip icon={Sparkles} label="Ask AI" to="/ai-chat" />
        </div>
      </section>

      {/* Attention Cards */}
      {dashboard && (
        <AttentionSection dashboard={dashboard} />
      )}

      {/* Shopping List Preview */}
      <section className="animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Shopping List</h2>
          <Link to="/shopping" className="text-sm text-primary flex items-center gap-0.5">
            View <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {dashboard?.shoppingItems && dashboard.shoppingItems.length > 0 ? (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {dashboard.shoppingItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-[15px]">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit.toLowerCase()}
                    </p>
                  </div>
                </div>
                <PriorityBadge priority={item.priority} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No pending items"
            description="Your shopping list is empty. Add items that need restocking."
            action={{ label: 'Add item', to: '/shopping' }}
          />
        )}
      </section>

      {/* Recent Activity */}
      <section className="animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Activity</h2>
          <Link to="/household" className="text-sm text-primary flex items-center gap-0.5">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <Card className="border-border">
          <CardContent className="p-4 space-y-3">
            {dashboard?.recentActivity?.length ? (
              <>
                {dashboard.recentActivity.slice(0, 5).map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    name={activity.user?.name || 'HomeStock'}
                    action={activity.message}
                    icon={activityIcon(activity.type)}
                    color={activityColor(activity.type)}
                    time={activity.createdAt}
                    avatarUrl={activity.user?.avatarUrl}
                  />
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Activity will appear here as your household uses items.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Inventory Snapshot */}
      <section className="animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Inventory Snapshot</h2>
          <Link to="/inventory" className="text-sm text-primary flex items-center gap-0.5">
            Browse <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {dashboard?.categoryCounts && dashboard.categoryCounts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {dashboard.categoryCounts.map((cat) => (
              <Link key={cat.category} to={`/inventory?category=${cat.category}`}>
                <Card className="hover:bg-secondary/30 transition-colors border-border">
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">{cat._count}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {cat.category.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No inventory yet"
            description="Start tracking items your household uses every day."
            action={{ label: 'Add first item', to: '/add' }}
          />
        )}
      </section>
    </div>
  );
}

function QuickChip({
  icon: Icon,
  label,
  to,
  color,
}: {
  icon: typeof Plus;
  label: string;
  to: string;
  color?: string;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors active:scale-95 ${
        color || 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

function AIChatSheet() {
  const { currentHousehold } = useHouseholdStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    { label: "What's running low?", icon: AlertTriangle },
    { label: 'What should I buy this week?', icon: ShoppingCart },
    { label: 'Do we have enough toilet paper?', icon: Package },
    { label: "What's running out next week?", icon: Clock },
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
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:bg-secondary/20 transition-colors text-left">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Ask HomeStock</p>
            <p className="text-xs text-muted-foreground">
              “What’s running low?” · “Add milk to the list”
            </p>
          </div>
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent className="px-0 pb-0">
        <SheetHeader className="px-5">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            HomeStock AI
          </SheetTitle>
          <SheetDescription>Ask about your household inventory and shopping list.</SheetDescription>
        </SheetHeader>

        <div className="px-5 py-4 space-y-4 h-[50vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.label)}
                  disabled={isLoading}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 text-left text-sm hover:bg-secondary/60 transition-colors"
                >
                  <s.icon className="w-4 h-4 text-primary" />
                  {s.label}
                </button>
              ))}
              <div className="flex gap-2 mt-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/40 text-sm font-medium hover:bg-secondary/60 transition-colors">
                  <Mic className="w-4 h-4" />
                  Voice
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/40 text-sm font-medium hover:bg-secondary/60 transition-colors">
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-1">
                Voice and camera capture open the Add Item scanner.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                    <span className="animate-pulse-soft">Thinking...</span>
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
              className="flex-1 h-11 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="rounded-full w-11 h-11 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AttentionSection({ dashboard }: { dashboard: DashboardData }) {
  const { currentHousehold } = useHouseholdStore();
  const { createItem } = useShoppingListStore();
  const navigate = useNavigate();

  const handleAddToList = async (item: { name: string; type: 'urgent' | 'warning' | 'info' }) => {
    if (!currentHousehold) return;
    await createItem(currentHousehold.id, {
      name: item.name,
      quantity: 1,
      unit: 'PIECE',
      priority: item.type === 'urgent' ? 'HIGH' : 'MEDIUM',
    });
  };

  const items: {
    id: string;
    name: string;
    detail: string;
    type: 'urgent' | 'warning' | 'info';
    icon: typeof AlertTriangle;
  }[] = [];

  dashboard.outOfStockItems.forEach((item: InventoryItem) => {
    items.push({
      id: item.id,
      name: item.name,
      detail: 'Out of stock',
      type: 'urgent',
      icon: AlertTriangle,
    });
  });

  dashboard.lowStockItems.forEach((item: InventoryItem) => {
    items.push({
      id: item.id,
      name: item.name,
      detail: `Low stock — ${item.quantity} left`,
      type: 'warning',
      icon: AlertTriangle,
    });
  });

  dashboard.expiringSoon.forEach((item: InventoryItem) => {
    const days = item.expiryDate
      ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    items.push({
      id: item.id,
      name: item.name,
      detail: days <= 0 ? 'Expires today' : `Expires in ${days} day${days > 1 ? 's' : ''}`,
      type: 'urgent',
      icon: Calendar,
    });
  });

  dashboard.predictedOutSoon.forEach((item: Prediction) => {
    items.push({
      id: item.itemId,
      name: item.name,
      detail: item.remainingDays
        ? `Running out in ${Math.round(item.remainingDays)} days`
        : 'Running low',
      type: 'info',
      icon: Clock,
    });
  });

  if (items.length === 0) return null;

  return (
    <section className="animate-fade-in-up stagger-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Needs Attention</h2>
        <Link to="/shopping" className="text-sm text-primary flex items-center gap-0.5">
          Review all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {items.slice(0, 5).map((item) => {
          const colors = {
            urgent: 'bg-destructive/10 text-destructive',
            warning: 'bg-warning/10 text-warning',
            info: 'bg-primary/10 text-primary',
          };

          return (
            <AttentionRow
              key={item.id}
              item={item}
              colorClass={colors[item.type]}
              onAddToList={() => handleAddToList(item)}
              onClick={() => navigate(`/inventory/${item.id}`)}
            />
          );
        })}
      </div>
    </section>
  );
}

function AttentionRow({
  item,
  colorClass,
  onAddToList,
  onClick,
}: {
  item: { id: string; name: string; detail: string; type: 'urgent' | 'warning' | 'info'; icon: typeof AlertTriangle };
  colorClass: string;
  onAddToList: () => void;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/20 transition-colors">
      <button
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <item.icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px] truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.detail}</p>
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium ${item.type === 'urgent' ? 'text-destructive' : item.type === 'warning' ? 'text-warning' : 'text-primary'}`}>
          {item.type === 'urgent' ? 'Now' : item.type === 'warning' ? 'Low' : 'Soon'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToList();
          }}
          className="w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
          aria-label={`Add ${item.name} to shopping list`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const labels: Record<string, { className: string; label: string }> = {
    LOW: { className: 'bg-secondary text-muted-foreground', label: 'Low' },
    MEDIUM: { className: 'bg-primary/10 text-primary', label: 'Medium' },
    HIGH: { className: 'bg-warning/10 text-warning', label: 'High' },
    URGENT: { className: 'bg-destructive/10 text-destructive', label: 'Urgent' },
  };

  const { className, label } = labels[priority] || labels.MEDIUM;

  return <span className={`text-xs font-medium px-2 py-1 rounded-md ${className}`}>{label}</span>;
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
        <img src={avatarUrl} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
      ) : (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{name}</span>{' '}
          <span className="text-muted-foreground">{action}</span>
        </p>
        {time && (
          <p className="text-xs text-muted-foreground/70">{formatActivityTime(time)}</p>
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
  if (type.includes('PURCHASED')) return 'bg-success/10 text-success';
  if (type.includes('ALERT')) return 'bg-destructive/10 text-destructive';
  if (type.includes('MEMBER')) return 'bg-primary/10 text-primary';
  if (type.includes('SHOPPING')) return 'bg-primary/10 text-primary';
  return 'bg-secondary text-muted-foreground';
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  action: { label: string; to: string };
}) {
  return (
    <Card className="text-center py-8 px-6 border-border">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Link to={action.to}>
        <Button size="sm" variant="outline" className="rounded-full">
          {action.label}
        </Button>
      </Link>
    </Card>
  );
}
