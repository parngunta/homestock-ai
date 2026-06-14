import { useEffect, useState } from 'react';
import { useShoppingListStore } from '@/stores/shopping-list-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/new-ui/avatar';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { UNIT_LABELS } from 'shared/src/constants';
import type { ShoppingListItem } from '@/types';

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const PRIORITY_CLASS: Record<string, string> = {
  LOW: 'bg-secondary text-muted-foreground',
  MEDIUM: 'bg-primary/10 text-primary',
  HIGH: 'bg-warning/10 text-warning',
  URGENT: 'bg-destructive/10 text-destructive',
};

export default function NewShoppingPage() {
  const { items, fetchItems, deleteItem, markPurchased } = useShoppingListStore();
  const { currentHousehold } = useHouseholdStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('pending');

  useEffect(() => {
    if (currentHousehold) fetchItems(currentHousehold.id);
  }, [currentHousehold?.id]);

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return item.status === 'PENDING';
    if (filter === 'purchased') return item.status === 'PURCHASED';
    return true;
  });

  const pendingItems = items.filter((i) => i.status === 'PENDING');
  const purchasedItems = items.filter((i) => i.status === 'PURCHASED');

  return (
    <div className="px-5 pt-6 pb-6 space-y-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight">Shopping List</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pendingItems.length} pending · {purchasedItems.length} purchased
        </p>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-secondary">
        {(['pending', 'purchased', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-card text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyShopping />
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
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
                onDelete={() =>
                  currentHousehold && deleteItem(currentHousehold.id, item.id)
                }
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No {filter === 'all' ? '' : filter} items.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI suggestion card */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Smart suggestions</p>
          <p className="text-xs text-muted-foreground">
            HomeStock can suggest items based on what’s running low.
          </p>
        </div>
        <Link to="/ai-chat" className="text-sm text-primary font-medium">
          Ask AI
        </Link>
      </div>
    </div>
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
    <div className={`flex items-center gap-3 px-4 py-3.5 bg-card ${isPurchased ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isPurchased
            ? 'bg-primary border-primary'
            : 'border-border hover:border-primary'
        }`}
        aria-label={isPurchased ? 'Mark pending' : 'Mark purchased'}
      >
        {isPurchased && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-[15px] truncate ${isPurchased ? 'line-through text-muted-foreground' : ''}`}>
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.quantity} {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${PRIORITY_CLASS[item.priority] || PRIORITY_CLASS.MEDIUM}`}>
          {PRIORITY_LABELS[item.priority] || item.priority}
        </span>

        {item.assignedTo && (
          <Avatar name={item.assignedTo.name || '?'} size="sm" />
        )}

        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyShopping() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Your list is empty</h2>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">
        Add items you need to buy. You can also ask HomeStock AI to suggest what’s running low.
      </p>
      <Link to="/add">
        <Button className="rounded-full px-5">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </Link>
    </div>
  );
}
