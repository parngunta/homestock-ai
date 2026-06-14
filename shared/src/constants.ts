import { ItemCategory, ItemLocation, ItemUnit } from './types';

export { HouseholdRole, ItemCategory, ItemLocation, ItemUnit, ShoppingItemStatus, ShoppingItemPriority, NotificationType, AdjustmentType } from './types';
export type { User, Household, HouseholdMember, InventoryItem, InventoryAdjustment, ShoppingListItem, ConsumptionRecord, Notification, BarcodeProduct, ReceiptImport } from './types';

export const ITEM_CATEGORIES = Object.values(ItemCategory);
export const ITEM_LOCATIONS = Object.values(ItemLocation);
export const ITEM_UNITS = Object.values(ItemUnit);

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  [ItemCategory.FOOD]: 'Food',
  [ItemCategory.BEVERAGE]: 'Beverage',
  [ItemCategory.CLEANING]: 'Cleaning',
  [ItemCategory.LAUNDRY]: 'Laundry',
  [ItemCategory.BATHROOM]: 'Bathroom',
  [ItemCategory.PET]: 'Pet',
  [ItemCategory.KITCHEN]: 'Kitchen',
  [ItemCategory.MEDICINE]: 'Medicine',
  [ItemCategory.OTHER]: 'Other',
};

export const LOCATION_LABELS: Record<ItemLocation, string> = {
  [ItemLocation.KITCHEN]: 'Kitchen',
  [ItemLocation.FRIDGE]: 'Fridge',
  [ItemLocation.FREEZER]: 'Freezer',
  [ItemLocation.BATHROOM]: 'Bathroom',
  [ItemLocation.LAUNDRY_ROOM]: 'Laundry Room',
  [ItemLocation.STORAGE_ROOM]: 'Storage Room',
  [ItemLocation.GARAGE]: 'Garage',
  [ItemLocation.CUSTOM]: 'Custom',
};

export const UNIT_LABELS: Record<ItemUnit, string> = {
  [ItemUnit.PIECE]: 'piece',
  [ItemUnit.ROLL]: 'roll',
  [ItemUnit.PACK]: 'pack',
  [ItemUnit.BOTTLE]: 'bottle',
  [ItemUnit.CAN]: 'can',
  [ItemUnit.BOX]: 'box',
  [ItemUnit.BAG]: 'bag',
  [ItemUnit.KG]: 'kg',
  [ItemUnit.LITER]: 'liter',
  [ItemUnit.ML]: 'ml',
  [ItemUnit.GRAM]: 'gram',
  [ItemUnit.OUNCE]: 'oz',
  [ItemUnit.POUND]: 'lb',
  [ItemUnit.GALLON]: 'gallon',
};