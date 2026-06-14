import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createHouseholdSchema = z.object({
  name: z.string().min(1).max(100),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const createInventoryItemSchema = z.object({
  householdId: z.string().uuid(),
  name: z.string().min(1).max(200),
  brand: z.string().max(200).optional(),
  category: z.enum(['FOOD', 'BEVERAGE', 'CLEANING', 'LAUNDRY', 'BATHROOM', 'PET', 'KITCHEN', 'MEDICINE', 'OTHER']).default('OTHER'),
  quantity: z.number().min(0).default(0),
  unit: z.enum(['PIECE', 'ROLL', 'PACK', 'BOTTLE', 'CAN', 'BOX', 'BAG', 'KG', 'LITER', 'ML', 'GRAM', 'OUNCE', 'POUND', 'GALLON']).default('PIECE'),
  location: z.enum(['KITCHEN', 'FRIDGE', 'FREEZER', 'BATHROOM', 'LAUNDRY_ROOM', 'STORAGE_ROOM', 'GARAGE', 'CUSTOM']).default('KITCHEN'),
  customLocation: z.string().max(200).optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional(),
  minimumThreshold: z.number().min(0).default(0),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(200).optional(),
  category: z.enum(['FOOD', 'BEVERAGE', 'CLEANING', 'LAUNDRY', 'BATHROOM', 'PET', 'KITCHEN', 'MEDICINE', 'OTHER']).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.enum(['PIECE', 'ROLL', 'PACK', 'BOTTLE', 'CAN', 'BOX', 'BAG', 'KG', 'LITER', 'ML', 'GRAM', 'OUNCE', 'POUND', 'GALLON']).optional(),
  location: z.enum(['KITCHEN', 'FRIDGE', 'FREEZER', 'BATHROOM', 'LAUNDRY_ROOM', 'STORAGE_ROOM', 'GARAGE', 'CUSTOM']).optional(),
  customLocation: z.string().max(200).optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional(),
  minimumThreshold: z.number().min(0).optional(),
  isArchived: z.boolean().optional(),
});

export const adjustQuantitySchema = z.object({
  type: z.enum(['ADD', 'REMOVE', 'SET']),
  quantity: z.number().positive(),
  note: z.string().max(500).optional(),
});

export const createShoppingItemSchema = z.object({
  householdId: z.string().uuid(),
  name: z.string().min(1).max(200),
  quantity: z.number().min(1).default(1),
  unit: z.enum(['PIECE', 'ROLL', 'PACK', 'BOTTLE', 'CAN', 'BOX', 'BAG', 'KG', 'LITER', 'ML', 'GRAM', 'OUNCE', 'POUND', 'GALLON']).default('PIECE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToUserId: z.string().uuid().optional(),
});

export const updateShoppingItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.number().min(1).optional(),
  unit: z.enum(['PIECE', 'ROLL', 'PACK', 'BOTTLE', 'CAN', 'BOX', 'BAG', 'KG', 'LITER', 'ML', 'GRAM', 'OUNCE', 'POUND', 'GALLON']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'PURCHASED']).optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
});