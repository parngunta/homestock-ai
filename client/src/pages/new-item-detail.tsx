import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '@/stores/inventory-store';
import { useHouseholdStore } from '@/stores/household-store';
import { useToast } from '@/components/new-ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { Card, CardContent } from '@/components/new-ui/card';
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
import { ArrowLeft, Plus, Minus, Archive, Trash2 } from 'lucide-react';
import { CATEGORY_LABELS, LOCATION_LABELS, UNIT_LABELS } from 'shared/src/constants';

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
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
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

  const isLow = currentItem.minimumThreshold > 0 && currentItem.quantity <= currentItem.minimumThreshold;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 safe-top bg-background border-b border-border">
        <div className="flex items-center justify-between px-5 h-14">
          <button onClick={() => navigate('/inventory')} className="p-2 -ml-2 rounded-full hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>

            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
              <AlertDialogTrigger asChild>
                <button className="w-11 h-11 rounded-full hover:bg-secondary text-muted-foreground flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring" aria-label="Archive item">
                  <Archive className="w-5 h-5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive {currentItem.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Archived items are hidden from inventory but can be restored later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setArchiveOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <button className="w-11 h-11 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring" aria-label="Delete item">
                  <Trash2 className="w-5 h-5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {currentItem.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the item and its history. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="px-5 pt-5 pb-28 space-y-6">
        <section className="text-center">
          <h1 className="text-2xl font-semibold">{currentItem.name}</h1>
          {currentItem.brand && <p className="text-muted-foreground text-sm">{currentItem.brand}</p>}
          <div className="flex items-baseline justify-center gap-2 mt-3">
            <span className="text-5xl font-semibold tracking-tight">{currentItem.quantity}</span>
            <span className="text-lg text-muted-foreground">{UNIT_LABELS[currentItem.unit as keyof typeof UNIT_LABELS] || currentItem.unit}</span>
          </div>
          {isLow && (
            <span className="inline-block mt-3 text-sm font-medium text-destructive">Low stock</span>
          )}
        </section>

        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full h-12 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <select
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="w-full h-12 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(LOCATION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-full">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-medium">{CATEGORY_LABELS[currentItem.category as keyof typeof CATEGORY_LABELS] || currentItem.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="font-medium">{LOCATION_LABELS[currentItem.location as keyof typeof LOCATION_LABELS] || currentItem.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Low stock alert</p>
                  <p className="font-medium">{currentItem.minimumThreshold} {UNIT_LABELS[currentItem.unit as keyof typeof UNIT_LABELS] || currentItem.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Barcode</p>
                  <p className="font-medium">{currentItem.barcode || '—'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            <p className="font-semibold text-sm">Quick Adjust</p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                className="w-20 text-center"
                min={1}
              />
              <Button onClick={() => handleAdjust('ADD')} className="flex-1 rounded-full">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
              <Button onClick={() => handleAdjust('REMOVE')} variant="outline" className="flex-1 rounded-full">
                <Minus className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>

        {currentItem.adjustments && currentItem.adjustments.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">History</h2>
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {currentItem.adjustments.map((adj) => (
                <div key={adj.id} className="flex items-center justify-between px-4 py-3 bg-card">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${adj.type === 'ADD' ? 'text-success' : adj.type === 'REMOVE' ? 'text-destructive' : 'text-primary'}`}>
                      {adj.type === 'ADD' ? '+' : adj.type === 'REMOVE' ? '−' : '→'} {adj.quantity}
                    </span>
                    <span className="text-sm text-muted-foreground">{adj.note}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{adj.previousQuantity} → {adj.newQuantity}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
