import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHouseholdStore } from '@/stores/household-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingListStore } from '@/stores/shopping-list-store';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { Card } from '@/components/new-ui/card';
import {
  ArrowLeft,
  Camera,
  Mic,
  ScanBarcode,
  Keyboard,
  ShoppingCart,
  Plus,
  Check,
} from 'lucide-react';
import { CATEGORY_LABELS, UNIT_LABELS } from 'shared/src/constants';
import type { VoiceResult } from '@/types';

export default function AddItemPage() {
  const navigate = useNavigate();
  const { currentHousehold } = useHouseholdStore();
  const { createItem } = useInventoryStore();
  const { createItem: createShoppingItem } = useShoppingListStore();

  const [mode, setMode] = useState<'receipt' | 'barcode' | 'voice' | 'manual' | 'shopping'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [barcode, setBarcode] = useState('');
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const [parsedReceiptItems, setParsedReceiptItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manualItem, setManualItem] = useState({
    name: '',
    quantity: 1,
    unit: 'PIECE' as const,
    category: 'OTHER' as const,
    minimumThreshold: 0,
    addToShoppingList: false,
  });

  if (!currentHousehold) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No household selected</h2>
        <p className="text-muted-foreground">Create a household first to add items.</p>
      </div>
    );
  }

  const handleManualAdd = async () => {
    if (!manualItem.name) return;
    await createItem(currentHousehold.id, manualItem);
    if (manualItem.addToShoppingList) {
      await createShoppingItem(currentHousehold.id, {
        name: manualItem.name,
        quantity: manualItem.quantity,
        unit: manualItem.unit,
        priority: 'MEDIUM',
      });
    }
    navigate('/');
  };

  const handleReceiptUpload = async (file: File) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await api.post(`/receipts/${currentHousehold.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.parsedItems) {
        try {
          const items = JSON.parse(res.data.parsedItems);
          if (Array.isArray(items)) {
            setParsedReceiptItems(items.map((item: any) => ({
              name: item.name || 'Unknown',
              quantity: item.quantity || 1,
              category: 'OTHER',
            })));
            setSelectedItems(new Set(items.map((_: any, i: number) => i)));
          }
        } catch {
          setParsedReceiptItems([]);
        }
      }
    } catch {
      // handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoice = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const res = await api.post('/voice/process', { transcript });
      setVoiceResult(res.data);
    } catch {
      setVoiceResult({ transcript, extracted: null });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcode = async () => {
    if (!barcode) return;
    setIsProcessing(true);
    try {
      const res = await api.get(`/barcode/lookup/${barcode}`);
      if (res.data.found) {
        setBarcodeProduct(res.data.product);
      } else {
        setBarcodeProduct(null);
      }
    } catch {
      setBarcodeProduct(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (index: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const importReceiptItems = async () => {
    const itemsToImport = parsedReceiptItems.filter((_, i) => selectedItems.has(i));
    for (const item of itemsToImport) {
      await createItem(currentHousehold.id, {
        name: item.name,
        quantity: item.quantity,
        category: item.category as any,
      });
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 safe-top bg-background border-b border-border">
        <div className="flex items-center gap-3 px-5 h-14">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Add Item</h1>
        </div>
      </header>

      <div className="px-5 pt-5 pb-28 space-y-6">
        {/* Mode selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <ModeButton icon={Keyboard} label="Manual" active={mode === 'manual'} onClick={() => setMode('manual')} />
          <ModeButton icon={ShoppingCart} label="Shopping" active={mode === 'shopping'} onClick={() => setMode('shopping')} />
          <ModeButton icon={Camera} label="Receipt" active={mode === 'receipt'} onClick={() => setMode('receipt')} />
          <ModeButton icon={ScanBarcode} label="Barcode" active={mode === 'barcode'} onClick={() => setMode('barcode')} />
          <ModeButton icon={Mic} label="Voice" active={mode === 'voice'} onClick={() => setMode('voice')} />
        </div>

        {mode === 'manual' && (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item name</label>
                <Input
                  placeholder="e.g. Toilet Paper"
                  value={manualItem.name}
                  onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    value={manualItem.quantity}
                    onChange={(e) => setManualItem({ ...manualItem, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    value={manualItem.unit}
                    onChange={(e) => setManualItem({ ...manualItem, unit: e.target.value as any })}
                    className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={manualItem.category}
                    onChange={(e) => setManualItem({ ...manualItem, category: e.target.value as any })}
                    className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Low stock alert</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={manualItem.minimumThreshold}
                    onChange={(e) => setManualItem({ ...manualItem, minimumThreshold: Number(e.target.value) })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={manualItem.addToShoppingList}
                  onChange={(e) => setManualItem({ ...manualItem, addToShoppingList: e.target.checked })}
                  className="rounded border-input"
                />
                Also add to shopping list
              </label>

              <Button onClick={handleManualAdd} className="w-full rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Add to Inventory
              </Button>
            </Card>
          </div>
        )}

        {mode === 'receipt' && (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])}
              />
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">Scan a receipt</p>
              <p className="text-sm text-muted-foreground mb-4">
                Take a photo and we’ll extract the items automatically.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="rounded-full"
              >
                {isProcessing ? 'Scanning...' : 'Upload Receipt'}
              </Button>
            </Card>

            {parsedReceiptItems.length > 0 && (
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-border/40 flex items-center justify-between">
                  <p className="font-semibold">Found {parsedReceiptItems.length} items</p>
                  <Button size="sm" onClick={importReceiptItems} className="rounded-full">
                    Import {selectedItems.size}
                  </Button>
                </div>
                <div className="divide-y divide-border/40">
                  {parsedReceiptItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => toggleItem(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selectedItems.has(i) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedItems.has(i) ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {selectedItems.has(i) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {mode === 'barcode' && (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="p-5 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-2">
                <ScanBarcode className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-center font-medium mb-1">Scan or type a barcode</p>
              <Input
                placeholder="Enter barcode number"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <Button onClick={handleBarcode} disabled={isProcessing} className="w-full rounded-full">
                {isProcessing ? 'Looking up...' : 'Look Up Product'}
              </Button>

              {barcodeProduct && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="font-semibold">{barcodeProduct.name}</p>
                  {barcodeProduct.brand && <p className="text-sm text-muted-foreground">{barcodeProduct.brand}</p>}
                  <Button
                    onClick={async () => {
                      await createItem(currentHousehold.id, {
                        name: barcodeProduct.name,
                        brand: barcodeProduct.brand,
                        category: barcodeProduct.category || 'OTHER',
                        unit: barcodeProduct.unit || 'PIECE',
                        quantity: 1,
                      });
                      navigate('/');
                    }}
                    className="w-full rounded-full"
                  >
                    Add to Inventory
                  </Button>
                </div>
              )}

              {barcodeProduct === null && barcode && !isProcessing && (
                <p className="text-sm text-muted-foreground text-center">
                  Product not found. Try adding it manually.
                </p>
              )}
            </Card>
          </div>
        )}

        {mode === 'voice' && (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="p-5 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-2">
                <Mic className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-center font-medium mb-1">Try voice input</p>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Say something like “I bought 2 packs of toilet paper”
              </p>

              {[
                'I bought 2 packs of toilet paper',
                'We need milk and eggs',
                'Added cat food',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => handleVoice(example)}
                  disabled={isProcessing}
                  className="w-full text-left px-4 py-3 rounded-xl bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                >
                  “{example}”
                </button>
              ))}
            </Card>

            {voiceResult && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Heard: {voiceResult.transcript}</p>
                {voiceResult.extracted ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-secondary/50">
                      <p className="font-medium">{voiceResult.extracted.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {voiceResult.extracted.quantity} {voiceResult.extracted.unit}
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        if (voiceResult.extracted?.action === 'add') {
                          await createItem(currentHousehold.id, {
                            name: voiceResult.extracted.name,
                            quantity: voiceResult.extracted.quantity,
                            unit: voiceResult.extracted.unit as any,
                          });
                        } else if (voiceResult.extracted?.action === 'remove') {
                          await createShoppingItem(currentHousehold.id, {
                            name: voiceResult.extracted.name,
                            quantity: voiceResult.extracted.quantity,
                            unit: voiceResult.extracted.unit as any,
                          });
                        }
                        navigate('/');
                      }}
                      className="w-full rounded-full"
                    >
                      Confirm &amp; Add
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Couldn’t extract item details. Try again.</p>
                )}
              </Card>
            )}
          </div>
        )}

        {mode === 'shopping' && (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item name</label>
                <Input placeholder="e.g. Milk" value={manualItem.name} onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input type="number" min={1} value={manualItem.quantity} onChange={(e) => setManualItem({ ...manualItem, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    value={manualItem.unit}
                    onChange={(e) => setManualItem({ ...manualItem, unit: e.target.value as any })}
                    className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (!manualItem.name) return;
                  await createShoppingItem(currentHousehold.id, {
                    name: manualItem.name,
                    quantity: manualItem.quantity,
                    unit: manualItem.unit,
                    priority: 'MEDIUM',
                  });
                  navigate('/shopping');
                }}
                className="w-full rounded-full"
              >
                Add to Shopping List
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Camera;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors active:scale-95 ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
