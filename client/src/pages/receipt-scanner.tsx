import { useState, useRef } from 'react';
import { useHouseholdStore } from '@/stores/household-store';
import { useInventoryStore } from '@/stores/inventory-store';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Check } from 'lucide-react';
import type { ReceiptData } from '@/types';

export default function ReceiptScannerPage() {
  const { currentHousehold } = useHouseholdStore();
  const { createItem } = useInventoryStore();
  const [, setReceipts] = useState<ReceiptData[]>([]);
  const [parsedItems, setParsedItems] = useState<{ name: string; quantity: number; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!currentHousehold) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await api.post(`/receipts/${currentHousehold.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const receipt = res.data as ReceiptData;

      if (receipt.parsedItems) {
        try {
          const items = JSON.parse(receipt.parsedItems);
          if (Array.isArray(items)) {
            setParsedItems(items.map((item: any) => ({
              name: item.name || 'Unknown',
              quantity: item.quantity || 1,
              category: 'OTHER',
            })));
            setSelectedItems(new Set(items.map((_: any, i: number) => i)));
          }
        } catch {
          setParsedItems([]);
        }
      }

      setReceipts((prev) => [receipt, ...prev]);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!currentHousehold) return;
    const itemsToImport = parsedItems.filter((_, i) => selectedItems.has(i));

    for (const item of itemsToImport) {
      await createItem(currentHousehold.id, {
        name: item.name,
        quantity: item.quantity,
        category: item.category as any,
      });
    }

    setParsedItems([]);
    setSelectedItems(new Set());
  };

  const toggleItem = (index: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Receipt Scanner</h2>

      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <Camera className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">Upload a receipt to scan and import items</p>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Processing...' : 'Upload Receipt'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {parsedItems.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Review Items</CardTitle>
            <Button onClick={handleImport} size="sm">
              <Check className="w-4 h-4 mr-1" /> Import Selected ({selectedItems.size})
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsedItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItems.has(i) ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => toggleItem(i)}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedItems.has(i) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                  }`}>
                    {selectedItems.has(i) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}