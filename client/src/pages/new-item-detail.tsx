import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInventoryStore } from '@/stores/inventory-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useToast } from '@/components/new-ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { Card, CardContent } from '@/components/new-ui/card';
import { Badge } from '@/components/new-ui/badge';
import { Skeleton } from '@/components/new-ui/skeleton';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/new-ui/alert-dialog';
import { ArrowLeft, Plus, Minus, Archive, Trash2, Calendar } from 'lucide-react';
import { CATEGORY_LABELS, LOCATION_LABELS, UNIT_LABELS } from 'shared/src/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
};

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

function getStatus(item: { minimumThreshold: number; quantity: number; expiryDate?: string | null; isArchived?: boolean }) {
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

export default function NewItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { currentItem, fetchItem, adjustQuantity, updateItem, deleteItem, archiveItem } = useInventoryStore();
  const { currentHousehold } = useHouseholdStore();
  const { toast } = useToast();
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    if (currentHousehold && itemId) fetchItem(currentHousehold.id, itemId);
  }, [currentHousehold?.id, itemId]);

  useEffect(() => {
    if (currentItem) {
      setEditData({
        name: currentItem.name,
        brand: currentItem.brand || '',
        category: currentItem.category,
        location: currentItem.location,
        unit: currentItem.unit,
        minimumThreshold: currentItem.minimumThreshold,
      });
    }
  }, [currentItem]);

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-background px-5 pt-4 pb-28 space-y-5">
        <header className="flex items-center gap-3 h-14">
          <button onClick={() => navigate('/inventory')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Skeleton className="h-6 w-32" />
        </header>
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  const handleAdjust = async (type: 'ADD' | 'REMOVE') => {
    if (!currentHousehold) return;
    try {
      await adjustQuantity(currentHousehold.id, currentItem.id, type, adjustAmount);
      toast(`${type === 'ADD' ? 'Added' : 'Removed'} ${adjustAmount} ${currentItem.unit.toLowerCase()}`, 'success');
    } catch {
      toast('Failed to adjust quantity', 'error');
    }
  };

  const handleSave = async () => {
    if (!currentHousehold) return;
    setIsSaving(true);
    try {
      await updateItem(currentHousehold.id, currentItem.id, editData);
      setEditing(false);
      toast('Changes saved', 'success');
    } catch {
      toast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentHousehold) return;
    try {
      await deleteItem(currentHousehold.id, currentItem.id);
      setDeleteOpen(false);
      toast(`${currentItem.name} deleted`, 'success');
      navigate('/inventory');
    } catch {
      toast('Failed to delete item', 'error');
    }
  };

  const handleArchive = async () => {
    if (!currentHousehold) return;
    try {
      await archiveItem(currentHousehold.id, currentItem.id);
      setArchiveOpen(false);
      toast(`${currentItem.name} archived`, 'success');
      navigate('/inventory');
    } catch {
      toast('Failed to archive item', 'error');
    }
  };

  const status = getStatus(currentItem);

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="sticky top-0 z-30 safe-top bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-5 h-16">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/inventory')}
            className="p-2 -ml-2 rounded-2xl hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="rounded-full">
              {editing ? 'Cancel' : 'Edit'}
            </Button>

            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className="w-11 h-11 rounded-2xl hover:bg-secondary text-muted-foreground flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Archive item"
                >
                  <Archive className="w-5 h-5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl">Archive {currentItem.name}?</AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    Archived items are hidden from inventory but can be restored later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setArchiveOpen(false)} className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive} className="rounded-full">Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className="w-11 h-11 rounded-2xl hover:bg-destructive/10 text-destructive flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl">Delete {currentItem.name}?</AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    This permanently removes the item and its history. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteOpen(false)} className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-full bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="px-5 pt-5 pb-28 space-y-6">
        <motion.section variants={itemVariants} className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center text-5xl mx-auto mb-4 shadow-soft">
            {getItemEmoji(currentItem.name, currentItem.category)}
          </div>
          <h1 className="text-3xl font-bold">{currentItem.name}</h1>
          {currentItem.brand && <p className="text-muted-foreground text-base mt-1">{currentItem.brand}</p>}
          <div className="flex items-baseline justify-center gap-2 mt-3">
            <span className="text-6xl font-bold tracking-tight">{currentItem.quantity}</span>
            <span className="text-xl text-muted-foreground">{UNIT_LABELS[currentItem.unit as keyof typeof UNIT_LABELS] || currentItem.unit}</span>
          </div>
          <div className="mt-4">
            <Badge variant={status.variant} size="md">{status.label}</Badge>
          </div>
        </motion.section>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardContent className="p-5 space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Name</label>
                    <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="h-14 rounded-2xl text-base" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Category</label>
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="w-full h-14 rounded-2xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Location</label>
                      <select
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full h-14 rounded-2xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        {Object.entries(LOCATION_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-full h-12 text-lg">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 text-base">
                  <div>
                    <p className="text-muted-foreground text-sm mb-0.5">Category</p>
                    <p className="font-semibold">{CATEGORY_LABELS[currentItem.category as keyof typeof CATEGORY_LABELS] || currentItem.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-0.5">Location</p>
                    <p className="font-semibold">{LOCATION_LABELS[currentItem.location as keyof typeof LOCATION_LABELS] || currentItem.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-0.5">Low stock alert</p>
                    <p className="font-semibold">{currentItem.minimumThreshold} {UNIT_LABELS[currentItem.unit as keyof typeof UNIT_LABELS] || currentItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-0.5">Barcode</p>
                    <p className="font-semibold">{currentItem.barcode || '—'}</p>
                  </div>
                  {currentItem.expiryDate && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-sm mb-0.5">Expiry date</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(currentItem.expiryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <p className="font-bold text-lg">Quick Adjust</p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-24 h-14 rounded-2xl text-center text-lg"
                  min={1}
                />
                <Button onClick={() => handleAdjust('ADD')} className="flex-1 rounded-full h-14 text-lg">
                  <Plus className="w-5 h-5 mr-1" /> Add
                </Button>
                <Button onClick={() => handleAdjust('REMOVE')} variant="outline" className="flex-1 rounded-full h-14 text-lg">
                  <Minus className="w-5 h-5 mr-1" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {currentItem.adjustments && currentItem.adjustments.length > 0 && (
          <motion.section variants={itemVariants} className="space-y-3">
            <h2 className="text-title">History</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {currentItem.adjustments.map((adj) => (
                    <div key={adj.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold text-lg ${adj.type === 'ADD' ? 'text-emerald-600' : adj.type === 'REMOVE' ? 'text-red-600' : 'text-primary'}`}>
                          {adj.type === 'ADD' ? '+' : adj.type === 'REMOVE' ? '−' : '→'} {adj.quantity}
                        </span>
                        <span className="text-base text-muted-foreground">{adj.note}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">{adj.previousQuantity} → {adj.newQuantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
