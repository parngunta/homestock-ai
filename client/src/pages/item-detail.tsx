import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '@/stores/inventory-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { CATEGORY_LABELS, LOCATION_LABELS, UNIT_LABELS } from 'shared/src/constants';

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { currentItem, fetchItem, adjustQuantity, updateItem } = useInventoryStore();
  const { currentHousehold } = useHouseholdStore();
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (currentHousehold && itemId) {
      fetchItem(currentHousehold.id, itemId);
    }
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
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>;
  }

  const handleAdjust = (type: 'ADD' | 'REMOVE') => {
    if (!currentHousehold) return;
    adjustQuantity(currentHousehold.id, currentItem.id, type, adjustAmount);
  };

  const handleSave = async () => {
    if (!currentHousehold) return;
    await updateItem(currentHousehold.id, currentItem.id, editData);
    setEditing(false);
  };

  const isLowStock = currentItem.minimumThreshold > 0 && currentItem.quantity <= currentItem.minimumThreshold;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">{currentItem.name}</h2>
        {isLowStock && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Low Stock</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input value={editData.brand} onChange={(e) => setEditData({ ...editData, brand: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={editData.category} onValueChange={(v) => setEditData({ ...editData, category: v })}>
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
                      <Select value={editData.location} onValueChange={(v) => setEditData({ ...editData, location: v })}>
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
                    <Input type="number" value={editData.minimumThreshold} onChange={(e) => setEditData({ ...editData, minimumThreshold: Number(e.target.value) })} />
                  </div>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Brand:</span> <span className="font-medium">{currentItem.brand || '—'}</span></div>
                  <div><span className="text-gray-500">Category:</span> <span className="font-medium">{CATEGORY_LABELS[currentItem.category as keyof typeof CATEGORY_LABELS] || currentItem.category}</span></div>
                  <div><span className="text-gray-500">Location:</span> <span className="font-medium">{LOCATION_LABELS[currentItem.location as keyof typeof LOCATION_LABELS] || currentItem.location}</span></div>
                  <div><span className="text-gray-500">Unit:</span> <span className="font-medium">{UNIT_LABELS[currentItem.unit as keyof typeof UNIT_LABELS] || currentItem.unit}</span></div>
                  <div><span className="text-gray-500">Min Threshold:</span> <span className="font-medium">{currentItem.minimumThreshold}</span></div>
                  <div><span className="text-gray-500">Barcode:</span> <span className="font-medium">{currentItem.barcode || '—'}</span></div>
                </div>
              )}
            </CardContent>
          </Card>

          {currentItem.adjustments && currentItem.adjustments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentItem.adjustments.map((adj) => (
                    <div key={adj.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                      <div>
                        <span className={`font-medium ${adj.type === 'ADD' ? 'text-green-600' : adj.type === 'REMOVE' ? 'text-red-600' : 'text-blue-600'}`}>
                          {adj.type === 'ADD' ? '+' : adj.type === 'REMOVE' ? '−' : '→'} {adj.quantity}
                        </span>
                        {adj.note && <span className="text-gray-500 ml-2">({adj.note})</span>}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {adj.previousQuantity} → {adj.newQuantity}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold">{currentItem.quantity}</p>
                <p className="text-gray-500 mt-1">{UNIT_LABELS[currentItem.unit as keyof typeof UNIT_LABELS] || currentItem.unit}</p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))} className="w-20 text-center" min={1} />
                <Button className="flex-1" onClick={() => handleAdjust('ADD')}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleAdjust('REMOVE')}>
                  <Minus className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}