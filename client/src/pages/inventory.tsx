import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '@/stores/inventory-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Trash2, Archive } from 'lucide-react';
import { CATEGORY_LABELS, LOCATION_LABELS, UNIT_LABELS } from 'shared/src/constants';

export default function InventoryPage() {
  const { items, fetchItems, createItem, deleteItem, archiveItem } = useInventoryStore();
  const { currentHousehold } = useHouseholdStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    brand: '',
    category: 'OTHER' as string,
    quantity: 1,
    unit: 'PIECE' as string,
    location: 'KITCHEN' as string,
    minimumThreshold: 0,
  });

  useEffect(() => {
    if (currentHousehold) {
      fetchItems(currentHousehold.id);
    }
  }, [currentHousehold?.id]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async () => {
    if (!currentHousehold || !newItem.name) return;
    await createItem(currentHousehold.id, newItem);
    setShowAddModal(false);
    setNewItem({ name: '', brand: '', category: 'OTHER', quantity: 1, unit: 'PIECE', location: 'KITCHEN', minimumThreshold: 0 });
    fetchItems(currentHousehold.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No items found. Add your first item to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/inventory/${item.id}`)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    {item.brand && <p className="text-xs text-gray-500">{item.brand}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold">{item.quantity}</span>
                      <span className="text-xs text-gray-500">{UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {LOCATION_LABELS[item.location as keyof typeof LOCATION_LABELS] || item.location}
                      </span>
                    </div>
                    {item.minimumThreshold > 0 && item.quantity <= item.minimumThreshold && (
                      <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveItem(currentHousehold!.id, item.id); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(currentHousehold!.id, item.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} placeholder="Brand (optional)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={newItem.unit} onValueChange={(v) => setNewItem({ ...newItem, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={newItem.location} onValueChange={(v) => setNewItem({ ...newItem, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Threshold</Label>
              <Input type="number" value={newItem.minimumThreshold} onChange={(e) => setNewItem({ ...newItem, minimumThreshold: Number(e.target.value) })} placeholder="Alert when below this amount" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}