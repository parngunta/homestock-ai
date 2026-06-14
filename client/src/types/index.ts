export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user?: User;
}

export interface InventoryItem {
  id: string;
  householdId: string;
  name: string;
  brand?: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  customLocation?: string;
  barcode?: string;
  imageUrl?: string;
  minimumThreshold: number;
  expiryDate?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  adjustments?: InventoryAdjustment[];
  consumptionRecords?: ConsumptionRecord[];
}

export interface InventoryAdjustment {
  id: string;
  inventoryItemId: string;
  userId: string;
  type: 'ADD' | 'REMOVE' | 'SET';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
  user?: User;
}

export interface ShoppingListItem {
  id: string;
  householdId: string;
  name: string;
  quantity: number;
  unit: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'PURCHASED';
  assignedToUserId?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User;
}

export interface ConsumptionRecord {
  id: string;
  inventoryItemId: string;
  householdId: string;
  quantityUsed: number;
  usageDurationDays: number;
  averageDailyConsumption: number;
  recordedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  householdId: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PREDICTED_OUT' | 'SHOPPING_REMINDER' | 'HOUSEHOLD_INVITATION';
  title: string;
  message: string;
  isRead: boolean;
  relatedItemId?: string;
  createdAt: string;
}

export interface Prediction {
  itemId: string;
  name: string;
  unit: string;
  quantity: number;
  averageConsumptionRate: number;
  remainingDays: number | null;
  predictedOutDate: string | null;
}

export interface DashboardData {
  totalItems: number;
  categoryCounts: { category: string; _count: number }[];
  locationCounts: { location: string; _count: number }[];
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  expiringSoon: InventoryItem[];
  predictedOutSoon: Prediction[];
  shoppingItems: ShoppingListItem[];
  recentActivity: Activity[];
  unreadNotifications: number;
  insights: string[];
}

export interface ReceiptData {
  id: string;
  imageUrl: string;
  ocrText?: string;
  parsedItems?: string;
  status: 'PENDING' | 'REVIEWED' | 'IMPORTED';
}

export interface BarcodeProduct {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  unit?: string;
  imageUrl?: string;
}

export interface Activity {
  id: string;
  householdId: string;
  userId?: string;
  type: string;
  message: string;
  metadata?: string;
  createdAt: string;
  user?: User;
}

export interface VoiceResult {
  transcript: string;
  extracted: {
    name: string;
    quantity: number;
    unit: string;
    action: 'add' | 'remove' | 'check';
  } | null;
  raw?: string;
}