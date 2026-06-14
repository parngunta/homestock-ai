import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useShoppingListStore } from '@/stores/shopping-list-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/new-ui/avatar';
import { Card, CardContent } from '@/components/new-ui/card';
import { Badge } from '@/components/new-ui/badge';
import { EmptyState } from '@/components/new-ui/empty-state';
import { Input } from '@/components/new-ui/input';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Sparkles,
  Search,
  Bot,
} from 'lucide-react';
import { UNIT_LABELS } from 'shared/src/constants';
import type { ShoppingListItem } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 340, damping: 28 } },
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

function priorityVariant(priority: string): 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'ghost' {
  switch (priority) {
    case 'LOW': return 'default';
    case 'MEDIUM': return 'primary';
    case 'HIGH': return 'warning';
    case 'URGENT': return 'danger';
    default: return 'primary';
  }
}

export default function NewShoppingPage() {
  const { items, fetchItems, deleteItem, markPurchased } = useShoppingListStore();
  const { currentHousehold } = useHouseholdStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (currentHousehold) fetchItems(currentHousehold.id);
  }, [currentHousehold?.id]);

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === 'pending'
        ? item.status === 'PENDING'
        : filter === 'purchased'
        ? item.status === 'PURCHASED'
        : true;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingItems = items.filter((i) => i.status === 'PENDING');
  const purchasedItems = items.filter((i) => i.status === 'PURCHASED');
  const total = items.length;
  const completed = purchasedItems.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      className="px-5 pt-6 pb-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants} className="space-y-1">
        <h1 className="text-hero">Shopping List</h1>
        <p className="text-base text-muted-foreground">
          {pendingItems.length} pending · {purchasedItems.length} purchased
        </p>
      </motion.header>

      {total > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">{progress}% complete</span>
            <span className="text-muted-foreground">{completed}/{total} items</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-green"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search your list..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 rounded-2xl text-base"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 p-1.5 rounded-2xl bg-secondary/60">
        {(['pending', 'purchased', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filter === f
                ? 'bg-card text-foreground shadow-soft border border-border/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your list is empty"
          description="Add items you need to buy. You can also ask HomeStock AI to suggest what’s running low."
        >
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/add">
              <Button className="rounded-full px-6">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </Link>
            <Link to="/ai-chat">
              <Button variant="outline" className="rounded-full px-6">
                <Bot className="w-4 h-4 mr-2" /> Ask AI
              </Button>
            </Link>
          </div>
        </EmptyState>
      ) : (
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {filteredItems.map((item) => (
                  <ShoppingRow
                    key={item.id}
                    item={item}
                    onToggle={() =>
                      currentHousehold &&
                      (item.status === 'PENDING'
                        ? markPurchased(currentHousehold.id, item.id)
                        : deleteItem(currentHousehold.id, item.id))
                    }
                    onDelete={() => currentHousehold && deleteItem(currentHousehold.id, item.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">No {filter === 'all' ? '' : filter} items</p>
              <p className="text-sm text-muted-foreground">Add something new to your list.</p>
            </div>
          )}
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className="gradient-blue text-white border-0 shadow-glow-blue">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-1">Smart suggestions</p>
                <p className="text-white/80 text-sm">
                  HomeStock can suggest items based on what’s running low.
                </p>
              </div>
              <Link to="/ai-chat" className="text-sm font-semibold text-white hover:text-white/90">
                Ask AI
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ShoppingRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingListItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isPurchased = item.status === 'PURCHASED';

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${isPurchased ? 'bg-secondary/20' : 'bg-card'}`}
    >
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onToggle}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isPurchased
            ? 'bg-primary border-primary'
            : 'border-border hover:border-primary'
        }`}
        aria-label={isPurchased ? 'Mark pending' : 'Mark purchased'}
      >
        {isPurchased && <Check className="w-4 h-4 text-white" />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-base truncate ${isPurchased ? 'line-through text-muted-foreground' : ''}`}>
          {item.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {item.quantity} {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isPurchased && (
          <Badge variant={priorityVariant(item.priority)} size="sm">
            {PRIORITY_LABELS[item.priority] || item.priority}
          </Badge>
        )}

        {item.assignedTo && (
          <Avatar name={item.assignedTo.name || '?'} size="sm" />
        )}

        <button
          onClick={onDelete}
          className="w-10 h-10 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
          aria-label="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
