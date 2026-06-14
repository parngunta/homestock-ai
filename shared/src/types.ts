export const HouseholdRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;
export type HouseholdRole = (typeof HouseholdRole)[keyof typeof HouseholdRole];

export const ItemCategory = {
  FOOD: 'FOOD',
  BEVERAGE: 'BEVERAGE',
  CLEANING: 'CLEANING',
  LAUNDRY: 'LAUNDRY',
  BATHROOM: 'BATHROOM',
  PET: 'PET',
  KITCHEN: 'KITCHEN',
  MEDICINE: 'MEDICINE',
  OTHER: 'OTHER',
} as const;
export type ItemCategory = (typeof ItemCategory)[keyof typeof ItemCategory];

export const ItemLocation = {
  KITCHEN: 'KITCHEN',
  FRIDGE: 'FRIDGE',
  FREEZER: 'FREEZER',
  BATHROOM: 'BATHROOM',
  LAUNDRY_ROOM: 'LAUNDRY_ROOM',
  STORAGE_ROOM: 'STORAGE_ROOM',
  GARAGE: 'GARAGE',
  CUSTOM: 'CUSTOM',
} as const;
export type ItemLocation = (typeof ItemLocation)[keyof typeof ItemLocation];

export const ItemUnit = {
  PIECE: 'PIECE',
  ROLL: 'ROLL',
  PACK: 'PACK',
  BOTTLE: 'BOTTLE',
  CAN: 'CAN',
  BOX: 'BOX',
  BAG: 'BAG',
  KG: 'KG',
  LITER: 'LITER',
  ML: 'ML',
  GRAM: 'GRAM',
  OUNCE: 'OUNCE',
  POUND: 'POUND',
  GALLON: 'GALLON',
} as const;
export type ItemUnit = (typeof ItemUnit)[keyof typeof ItemUnit];

export const ShoppingItemStatus = {
  PENDING: 'PENDING',
  PURCHASED: 'PURCHASED',
} as const;
export type ShoppingItemStatus = (typeof ShoppingItemStatus)[keyof typeof ShoppingItemStatus];

export const ShoppingItemPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type ShoppingItemPriority = (typeof ShoppingItemPriority)[keyof typeof ShoppingItemPriority];

export const NotificationType = {
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  PREDICTED_OUT: 'PREDICTED_OUT',
  SHOPPING_REMINDER: 'SHOPPING_REMINDER',
  HOUSEHOLD_INVITATION: 'HOUSEHOLD_INVITATION',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const AdjustmentType = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  SET: 'SET',
} as const;
export type AdjustmentType = (typeof AdjustmentType)[keyof typeof AdjustmentType];

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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
  role: HouseholdRole;
  joinedAt: string;
}

export interface InventoryItem {
  id: string;
  householdId: string;
  name: string;
  brand?: string;
  category: ItemCategory;
  quantity: number;
  unit: ItemUnit;
  location: ItemLocation;
  customLocation?: string;
  barcode?: string;
  imageUrl?: string;
  minimumThreshold: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAdjustment {
  id: string;
  inventoryItemId: string;
  userId: string;
  type: AdjustmentType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  householdId: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  priority: ShoppingItemPriority;
  status: ShoppingItemStatus;
  assignedToUserId?: string;
  createdAt: string;
  updatedAt: string;
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

export interface Notification {
  id: string;
  userId: string;
  householdId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedItemId?: string;
  createdAt: string;
}

export interface BarcodeProduct {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  category?: ItemCategory;
  unit?: ItemUnit;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptImport {
  id: string;
  householdId: string;
  userId: string;
  imageUrl: string;
  ocrText?: string;
  parsedItems?: string;
  status: 'PENDING' | 'REVIEWED' | 'IMPORTED';
  createdAt: string;
  updatedAt: string;
}