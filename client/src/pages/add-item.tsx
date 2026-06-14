import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHouseholdStore } from '@/stores/household-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingListStore } from '@/stores/shopping-list-store';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { Card, CardContent } from '@/components/new-ui/card';
import { EmptyState } from '@/components/new-ui/empty-state';
import {
  ArrowLeft,
  Camera,
  Mic,
  ScanBarcode,
  Keyboard,
  ShoppingCart,
  Plus,
  Check,
  Sparkles,
  Home,
} from 'lucide-react';
import { CATEGORY_LABELS, UNIT_LABELS } from 'shared/src/constants';
import type { VoiceResult } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
};

const modes: { id: 'manual' | 'receipt' | 'barcode' | 'voice' | 'shopping'; label: string; icon: typeof Keyboard; color: string }[] = [
  { id: 'manual', label: 'Manual', icon: Keyboard, color: 'bg-slate-500' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'bg-blue-500' },
  { id: 'receipt', label: 'Receipt', icon: Camera, color: 'bg-violet-500' },
  { id: 'barcode', label: 'Barcode', icon: ScanBarcode, color: 'bg-amber-500' },
  { id: 'voice', label: 'Voice', icon: Mic, color: 'bg-rose-500' },
];



export default function AddItemPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentHousehold } = useHouseholdStore();
  const { createItem } = useInventoryStore();
  const { createItem: createShoppingItem } = useShoppingListStore();

  const initialMode = (searchParams.get('mode') as any) || 'manual';
  const [mode, setMode] = useState<'receipt' | 'barcode' | 'voice' | 'manual' | 'shopping'>(initialMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [barcode, setBarcode] = useState('');
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const [parsedReceiptItems, setParsedReceiptItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manualItem, setManualItem] = useState({
    name: searchParams.get('name') || '',
    quantity: 1,
    unit: 'PIECE' as const,
    category: 'OTHER' as const,
    minimumThreshold: 0,
    expiryDate: '',
    addToShoppingList: false,
  });

  useEffect(() => {
    const m = searchParams.get('mode') as typeof mode | null;
    if (m && ['receipt', 'barcode', 'voice', 'shopping', 'manual'].includes(m)) setMode(m);
  }, [searchParams.get('mode')]);

  if (!currentHousehold) {
    return (
      <EmptyState
        icon={Home}
        title="No household selected"
        description="Create a household first to add items."
      >
        <Button onClick={() => navigate('/household')} className="rounded-full px-6">Create Household</Button>
      </EmptyState>
    );
  }

  const handleManualAdd = async () => {
    if (!manualItem.name) return;
    const payload: any = { ...manualItem };
    if (!payload.expiryDate) delete payload.expiryDate;
    delete payload.addToShoppingList;
    await createItem(currentHousehold.id, payload);
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
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="sticky top-0 z-30 safe-top bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center gap-3 px-5 h-16">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-2xl hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold">Add Item</h1>
        </div>
      </header>

      <div className="px-5 pt-5 pb-28 space-y-6">
        <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = mode.toLowerCase() === m.id;
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-card border border-border/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {m.label}
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'manual' && (
            <motion.div
              key="manual"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-5 space-y-5">
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Item name</label>
                    <Input
                      placeholder="e.g. Toilet Paper"
                      value={manualItem.name}
                      onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                      className="h-14 rounded-2xl text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Quantity</label>
                      <Input
                        type="number"
                        min={1}
                        value={manualItem.quantity}
                        onChange={(e) => setManualItem({ ...manualItem, quantity: Number(e.target.value) })}
                        className="h-14 rounded-2xl text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Unit</label>
                      <select
                        value={manualItem.unit}
                        onChange={(e) => setManualItem({ ...manualItem, unit: e.target.value as any })}
                        className="w-full h-14 rounded-2xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        {Object.entries(UNIT_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Category</label>
                      <select
                        value={manualItem.category}
                        onChange={(e) => setManualItem({ ...manualItem, category: e.target.value as any })}
                        className="w-full h-14 rounded-2xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Expiry date</label>
                      <Input
                        type="date"
                        value={manualItem.expiryDate}
                        onChange={(e) => setManualItem({ ...manualItem, expiryDate: e.target.value })}
                        className="h-14 rounded-2xl text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Low stock alert</label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={manualItem.minimumThreshold}
                        onChange={(e) => setManualItem({ ...manualItem, minimumThreshold: Number(e.target.value) })}
                        className="h-14 rounded-2xl text-base"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-base">
                    <div
                      onClick={() => setManualItem((s) => ({ ...s, addToShoppingList: !s.addToShoppingList }))}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        manualItem.addToShoppingList ? 'bg-primary border-primary' : 'border-border'
                      }`}
                    >
                      {manualItem.addToShoppingList && <Check className="w-4 h-4 text-white" />}
                    </div>
                    Also add to shopping list
                  </label>
                </CardContent>
              </Card>

              <Button onClick={handleManualAdd} className="w-full rounded-full h-14 text-lg">
                <Plus className="w-5 h-5 mr-2" /> Add to Inventory
              </Button>
            </motion.div>
          )}

          {mode === 'receipt' && (
            <motion.div
              key="receipt"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])}
                  />
                  <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
                    <Camera className="w-10 h-10 text-violet-600" />
                  </div>
                  <p className="font-bold text-xl mb-1">Scan a receipt</p>
                  <p className="text-base text-muted-foreground mb-6">Take a photo and we’ll extract the items automatically.</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="rounded-full h-12 px-6"
                  >
                    {isProcessing ? 'Scanning...' : 'Upload Receipt'}
                  </Button>
                </CardContent>
              </Card>

              {parsedReceiptItems.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <p className="font-bold text-base">Found {parsedReceiptItems.length} items</p>
                    <Button size="sm" onClick={importReceiptItems} className="rounded-full">
                      Import {selectedItems.size}
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {parsedReceiptItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => toggleItem(i)}
                          className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                            selectedItems.has(i) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedItems.has(i) ? 'bg-primary border-primary' : 'border-border'
                          }`}>
                            {selectedItems.has(i) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-base">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {mode === 'barcode' && (
            <motion.div
              key="barcode"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto">
                    <ScanBarcode className="w-10 h-10 text-amber-600" />
                  </div>
                  <p className="font-bold text-xl mb-1">Scan or type a barcode</p>
                  <Input
                    placeholder="Enter barcode number"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="h-14 rounded-2xl text-base"
                  />
                  <Button onClick={handleBarcode} disabled={isProcessing} className="w-full rounded-full h-12">
                    {isProcessing ? 'Looking up...' : 'Look Up Product'}
                  </Button>

                  {barcodeProduct && (
                    <div className="mt-4 p-5 rounded-3xl bg-secondary/50 space-y-3 text-left">
                      <p className="font-bold text-lg">{barcodeProduct.name}</p>
                      {barcodeProduct.brand && <p className="text-base text-muted-foreground">{barcodeProduct.brand}</p>}
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
                        className="w-full rounded-full h-12"
                      >
                        Add to Inventory
                      </Button>
                    </div>
                  )}

                  {barcodeProduct === null && barcode && !isProcessing && (
                    <p className="text-base text-muted-foreground text-center">Product not found. Try adding it manually.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {mode === 'voice' && (
            <motion.div
              key="voice"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-rose-100 flex items-center justify-center mx-auto mb-5">
                    <Mic className="w-10 h-10 text-rose-600" />
                  </div>
                  <p className="font-bold text-xl mb-1">Try voice input</p>
                  <p className="text-base text-muted-foreground mb-5">Say something like “I bought 2 packs of toilet paper”</p>

                  {[
                    'I bought 2 packs of toilet paper',
                    'We need milk and eggs',
                    'Added cat food',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => handleVoice(example)}
                      disabled={isProcessing}
                      className="w-full text-left px-5 py-4 rounded-2xl bg-secondary/50 text-base hover:bg-secondary transition-colors mb-2"
                    >
                      “{example}”
                    </button>
                  ))}
                </CardContent>
              </Card>

              {voiceResult && (
                <Card className="overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <p className="text-base text-muted-foreground mb-2">Heard: {voiceResult.transcript}</p>
                    {voiceResult.extracted ? (
                      <>
                        <div className="p-4 rounded-2xl bg-secondary/50">
                          <p className="font-bold text-lg">{voiceResult.extracted.name}</p>
                          <p className="text-base text-muted-foreground">
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
                          className="w-full rounded-full h-12"
                        >
                          Confirm &amp; Add
                        </Button>
                      </>
                    ) : (
                      <p className="text-base text-muted-foreground">Couldn’t extract item details. Try again.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {mode === 'shopping' && (
            <motion.div
              key="shopping"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-5 space-y-5">
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Item name</label>
                    <Input
                      placeholder="e.g. Milk"
                      value={manualItem.name}
                      onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                      className="h-14 rounded-2xl text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Quantity</label>
                      <Input
                        type="number"
                        min={1}
                        value={manualItem.quantity}
                        onChange={(e) => setManualItem({ ...manualItem, quantity: Number(e.target.value) })}
                        className="h-14 rounded-2xl text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-semibold">Unit</label>
                      <select
                        value={manualItem.unit}
                        onChange={(e) => setManualItem({ ...manualItem, unit: e.target.value as any })}
                        className="w-full h-14 rounded-2xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        {Object.entries(UNIT_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                className="w-full rounded-full h-14 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Shopping List
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="pt-6">
          <Card className="gradient-green text-white border-0 shadow-glow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Not sure what to add?</p>
                  <p className="text-white/80 text-sm">Ask HomeStock what’s running low.</p>
                </div>
                <Button variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/20 bg-transparent" onClick={() => navigate('/ai-chat')}>
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}


