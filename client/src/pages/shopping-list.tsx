import { useEffect, useState } from 'react';
import { useShoppingListStore } from '@/stores/shopping-list-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ShoppingCart, Check, Trash2 } from 'lucide-react';
import { UNIT_LABELS } from 'shared/src/constants';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function ShoppingListPage() {
  const { items, fetchItems, createItem, deleteItem, markPurchased } = useShoppingListStore();
  const { currentHousehold } = useHouseholdStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'PIECE' as const, priority: 'MEDIUM' as const });
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  useEffect(() => {
    if (currentHousehold) fetchItems(currentHousehold.id);
  }, [currentHousehold?.id]);

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return item.status === 'PENDING';
    if (filter === 'purchased') return item.status === 'PURCHASED';
    return true;
  });

  const pendingItems = filteredItems.filter((i) => i.status === 'PENDING');
  const purchasedItems = filteredItems.filter((i) => i.status === 'PURCHASED');

  const handleCreate = async () => {
    if (!currentHousehold || !newItem.name) return;
    await createItem(currentHousehold.id, newItem);
    setShowAddModal(false);
    setNewItem({ name: '', quantity: 1, unit: 'PIECE' as const, priority: 'MEDIUM' as const });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shopping List</h2>
        <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'purchased'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {pendingItems.length === 0 && purchasedItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Your shopping list is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">To Buy</h3>
              {pendingItems.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => markPurchased(currentHousehold!.id, item.id)}
                          className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 transition-colors"
                        />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.MEDIUM}`}>
                          {item.priority}
                        </span>
                        <button onClick={() => deleteItem(currentHousehold!.id, item.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {purchasedItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Purchased</h3>
              {purchasedItems.map((item) => (
                <Card key={item.id} className="opacity-60">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm line-through">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteItem(currentHousehold!.id, item.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Shopping List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={newItem.unit} onValueChange={(v) => setNewItem({ ...newItem, unit: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newItem.priority} onValueChange={(v) => setNewItem({ ...newItem, priority: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}