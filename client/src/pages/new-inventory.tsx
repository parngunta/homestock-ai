import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '@/stores/inventory-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useToast } from '@/components/new-ui/toast';
import { Input } from '@/components/new-ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Package,
  Archive,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { CATEGORY_LABELS, UNIT_LABELS } from 'shared/src/constants';
import type { InventoryItem } from '@/types';

const filters = [
  { key: 'all', label: 'All' },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label })),
];

export default function NewInventoryPage() {
  const { items, fetchItems, archiveItem } = useInventoryStore();
  const { currentHousehold } = useHouseholdStore();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const selectedCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    if (currentHousehold) {
      fetchItems(currentHousehold.id, selectedCategory === 'all' ? {} : { category: selectedCategory });
    }
  }, [currentHousehold?.id, selectedCategory]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = filteredItems.filter(
    (item) => item.minimumThreshold > 0 && item.quantity <= item.minimumThreshold && !item.isArchived
  );

  const regularItems = filteredItems.filter(
    (item) => !(item.minimumThreshold > 0 && item.quantity <= item.minimumThreshold) && !item.isArchived
  );

  const setCategory = (key: string) => {
    if (key === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', key);
    }
    setSearchParams(searchParams);
  };

  const handleArchive = async (item: InventoryItem) => {
    if (!currentHousehold) return;
    try {
      await archiveItem(currentHousehold.id, item.id);
      toast(`${item.name} archived`, 'success');
    } catch {
      toast('Failed to archive item', 'error');
    }
  };

  return (
    <div className="px-5 pt-6 pb-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentHousehold ? `${items.length} items in ${currentHousehold.name}` : ''}
          </p>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 rounded-xl border-border bg-secondary/50"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setCategory(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors active:scale-95 ${
              selectedCategory === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyInventory />
      ) : (
        <div className="space-y-6">
          {lowStockItems.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h2 className="font-semibold text-sm">Running Low</h2>
              </div>
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {lowStockItems.map((item) => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    low
                    onArchive={() => handleArchive(item)}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {regularItems.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-sm">
                {search ? 'Search Results' : selectedCategory === 'all' ? 'All Items' : filters.find((f) => f.key === selectedCategory)?.label}
              </h2>
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {regularItems.map((item) => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    onArchive={() => handleArchive(item)}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredItems.length === 0 && search && (
            <div className="text-center py-12 px-6">
              <p className="text-muted-foreground mb-3">No items match “{search}”.</p>
              <Link to={`/add?name=${encodeURIComponent(search)}`}>
                <Button size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add “{search}”
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InventoryRow({
  item,
  low,
  onArchive,
  onClick,
}: {
  item: InventoryItem;
  low?: boolean;
  onArchive: () => void;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-secondary text-muted-foreground">
        <Package className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[15px] truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-muted-foreground">
            {item.quantity} {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
          </span>
          {low && (
            <span className="text-xs font-medium text-warning">Low</span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onArchive();
        }}
        className="w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Archive ${item.name}`}
      >
        <Archive className="w-4 h-4" />
      </button>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function EmptyInventory() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Your inventory is empty</h2>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">
        Start by adding items your household uses.
      </p>
      <Link to="/add">
        <Button className="rounded-full px-5">
          <Plus className="w-4 h-4 mr-2" />
          Add First Item
        </Button>
      </Link>
    </div>
  );
}
