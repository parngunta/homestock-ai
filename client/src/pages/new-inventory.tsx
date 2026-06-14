import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInventoryStore } from '@/stores/inventory-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useToast } from '@/components/new-ui/toast';
import { Input } from '@/components/new-ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/new-ui/card';
import { Badge } from '@/components/new-ui/badge';
import { EmptyState } from '@/components/new-ui/empty-state';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Package,
  Archive,
  AlertTriangle,
  ChevronRight,
  SlidersHorizontal,
  Utensils,
  SprayCan,
  Pill,
  Baby,
  Wrench,
  Sparkles,
  ShoppingBasket,
  Milk,
} from 'lucide-react';
import { CATEGORY_LABELS, UNIT_LABELS } from 'shared/src/constants';
import type { InventoryItem } from '@/types';

const filters = [
  { key: 'all', label: 'All', icon: SlidersHorizontal },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
    icon: categoryIcon(key),
  })),
];

function categoryIcon(key: string) {
  const map: Record<string, typeof Package> = {
    food: Utensils,
    beverage: Milk,
    household: SprayCan,
    personal: SprayCan,
    health: Pill,
    baby: Baby,
    other: Wrench,
  };
  return map[key] || ShoppingBasket;
}

function getItemEmoji(name: string, category?: string): string {
  const map: Record<string, string> = {
    toilet: '🧻', paper: '🧻', cat: '🐱', food: '🥫', dog: '🐶', pet: '🐾',
    milk: '🥛', egg: '🥚', bread: '🍞', cheese: '🧀', butter: '🧈', yogurt: '🥣',
    fruit: '🍎', apple: '🍎', banana: '🍌', orange: '🍊', vegetable: '🥬',
    coffee: '☕', tea: '🍵', water: '💧', juice: '🧃', soda: '🥤',
    detergent: '🧼', soap: '🧼', shampoo: '🧴', laundry: '🧺',
    medicine: '💊', pill: '💊', vitamin: '💊', bandage: '🩹',
    rice: '🍚', pasta: '🍝', cereal: '🥣', oil: '🫒', sugar: '🍬', salt: '🧂',
    chicken: '🍗', beef: '🥩', fish: '🐟', shrimp: '🦐',
    diaper: '🍼', baby: '🍼', wipe: '🧻',
    battery: '🔋', light: '💡', bag: '🛍️', trash: '🗑️',
  };
  const key = Object.keys(map).find((k) => name.toLowerCase().includes(k) || category?.toLowerCase().includes(k));
  return key ? map[key] : '📦';
}

function getStatus(item: InventoryItem) {
  if (item.isArchived) return { label: 'Archived', variant: 'ghost' as const };
  if (item.expiryDate) {
    const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 2) return { label: days <= 0 ? 'Expired' : 'Expiring', variant: 'danger' as const };
    if (days <= 5) return { label: 'Expiring soon', variant: 'warning' as const };
  }
  if (item.minimumThreshold > 0 && item.quantity <= item.minimumThreshold) {
    return { label: 'Low stock', variant: 'warning' as const };
  }
  if (item.quantity === 0) return { label: 'Out', variant: 'danger' as const };
  return { label: 'In stock', variant: 'success' as const };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
};

export default function NewInventoryPage() {
  const { items, fetchItems, archiveItem } = useInventoryStore();
  const { currentHousehold } = useHouseholdStore();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
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
    <motion.div
      className="px-5 pt-6 pb-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants} className="space-y-1">
        <h1 className="text-hero">Inventory</h1>
        <p className="text-base text-muted-foreground">
          {currentHousehold ? `${items.length} items in ${currentHousehold.name}` : ''}
        </p>
      </motion.header>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 rounded-2xl text-base"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const active = selectedCategory === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setCategory(f.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-card border border-border/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" /> {f.label}
            </button>
          );
        })}
      </motion.div>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Your inventory is empty"
          description="Start by adding items your household uses."
        >
          <Link to="/add">
            <Button className="rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <motion.div variants={itemVariants} className="space-y-6">
          {filteredItems.length === 0 && search ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold mb-1">No items match “{search}”</p>
              <p className="text-base text-muted-foreground mb-5">Add it as a new household item.</p>
              <Link to={`/add?name=${encodeURIComponent(search)}`}>
                <Button size="lg" className="rounded-full px-6">
                  <Plus className="w-5 h-5 mr-2" />
                  Add “{search}”
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <InventoryGrid items={filteredItems} onArchive={handleArchive} />
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function InventoryGrid({
  items,
  onArchive,
}: {
  items: InventoryItem[];
  onArchive: (item: InventoryItem) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => {
        const status = getStatus(item);
        return (
          <motion.div
            key={item.id}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Card
              className="overflow-hidden cursor-pointer hover:shadow-card transition-shadow"
              onClick={() => navigate(`/inventory/${item.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-3xl shrink-0">
                    {getItemEmoji(item.name, item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-card-title truncate">{item.name}</p>
                        <p className="text-base text-muted-foreground">
                          {item.quantity} {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                      {item.minimumThreshold > 0 && item.quantity <= item.minimumThreshold && !item.isArchived && (
                        <Badge variant="warning" size="sm" className="gap-1">
                          <AlertTriangle className="w-3 h-3" /> {item.minimumThreshold} min
                        </Badge>
                      )}
                      {item.expiryDate && !item.isArchived && (
                        <Badge variant="ghost" size="sm">
                          {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              {!item.isArchived && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(item);
                  }}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Archive ${item.name}`}
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
