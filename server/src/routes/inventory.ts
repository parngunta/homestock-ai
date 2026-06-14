import { Router } from 'express';
import { ActivityService } from '../services/activity-service';
import { prisma } from '../utils/db';
import { AuthRequest, getParam, getQuery } from '../middleware/auth';
import { createInventoryItemSchema, updateInventoryItemSchema, adjustQuantitySchema } from '../utils/validations';

export const inventoryRouter = Router();

inventoryRouter.get('/:householdId/items', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const category = getQuery(req, 'category');
  const location = getQuery(req, 'location');
  const isArchived = getQuery(req, 'isArchived');
  const search = getQuery(req, 'search');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const where: any = { householdId, isArchived: isArchived === 'true' };
  if (category) where.category = category;
  if (location) where.location = location;
  if (search) where.name = { contains: search };

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });

  return res.json(items);
});

inventoryRouter.post('/:householdId/items', async (req: AuthRequest, res) => {
  try {
    const householdId = getParam(req, 'householdId');
    const data = createInventoryItemSchema.parse({ ...req.body, householdId });

    const member = await prisma.householdMember.findFirst({
      where: { userId: req.userId!, householdId },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this household' });
    }

    const item = await prisma.inventoryItem.create({ data });

    if (data.quantity > 0) {
      await prisma.inventoryAdjustment.create({
        data: {
          inventoryItemId: item.id,
          userId: req.userId!,
          type: 'ADD',
          quantity: data.quantity,
          previousQuantity: 0,
          newQuantity: data.quantity,
          note: 'Initial stock',
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
    await ActivityService.record({
      householdId,
      userId: req.userId!,
      type: 'ITEM_CREATED',
      message: `${user?.name || 'Someone'} added ${item.name} to inventory`,
      metadata: { itemId: item.id, quantity: item.quantity, unit: item.unit },
    });

    return res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

inventoryRouter.get('/:householdId/items/:itemId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const itemId = getParam(req, 'itemId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const item = await prisma.inventoryItem.findFirst({
    where: { id: itemId, householdId },
    include: {
      adjustments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
      consumptionRecords: { orderBy: { recordedAt: 'desc' } },
    },
  });

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  return res.json(item);
});

inventoryRouter.patch('/:householdId/items/:itemId', async (req: AuthRequest, res) => {
  try {
    const householdId = getParam(req, 'householdId');
    const itemId = getParam(req, 'itemId');
    const data = updateInventoryItemSchema.parse(req.body);

    const member = await prisma.householdMember.findFirst({
      where: { userId: req.userId!, householdId },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this household' });
    }

    const existing = await prisma.inventoryItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (data.quantity !== undefined && data.quantity !== existing.quantity) {
      await prisma.inventoryAdjustment.create({
        data: {
          inventoryItemId: itemId,
          userId: req.userId!,
          type: 'SET',
          quantity: data.quantity,
          previousQuantity: existing.quantity,
          newQuantity: data.quantity,
        },
      });
    }

    const item = await prisma.inventoryItem.update({
      where: { id: itemId },
      data,
    });

    const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
    await ActivityService.record({
      householdId,
      userId: req.userId!,
      type: 'ITEM_UPDATED',
      message: `${user?.name || 'Someone'} updated ${item.name}`,
      metadata: { itemId: item.id, changes: Object.keys(data) },
    });

    return res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

inventoryRouter.delete('/:householdId/items/:itemId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const itemId = getParam(req, 'itemId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, householdId } });
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  await prisma.inventoryItem.delete({ where: { id: itemId } });

  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
  await ActivityService.record({
    householdId,
    userId: req.userId!,
    type: 'ITEM_ARCHIVED',
    message: `${user?.name || 'Someone'} removed ${item.name} from inventory`,
    metadata: { itemId },
  });

  return res.json({ success: true });
});

inventoryRouter.post('/:householdId/items/:itemId/adjust', async (req: AuthRequest, res) => {
  try {
    const householdId = getParam(req, 'householdId');
    const itemId = getParam(req, 'itemId');
    const data = adjustQuantitySchema.parse(req.body);

    const member = await prisma.householdMember.findFirst({
      where: { userId: req.userId!, householdId },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this household' });
    }

    const item = await prisma.inventoryItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    let newQuantity: number;
    switch (data.type) {
      case 'ADD':
        newQuantity = item.quantity + data.quantity;
        break;
      case 'REMOVE':
        newQuantity = Math.max(0, item.quantity - data.quantity);
        break;
      case 'SET':
        newQuantity = data.quantity;
        break;
      default:
        return res.status(400).json({ error: 'Invalid adjustment type' });
    }

    const [adjustment, updated] = await prisma.$transaction([
      prisma.inventoryAdjustment.create({
        data: {
          inventoryItemId: itemId,
          userId: req.userId!,
          type: data.type,
          quantity: data.quantity,
          previousQuantity: item.quantity,
          newQuantity,
          note: data.note,
        },
      }),
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: newQuantity },
      }),
    ]);

    if (newQuantity <= item.minimumThreshold && item.minimumThreshold > 0) {
      await prisma.notification.create({
        data: {
          userId: req.userId!,
          householdId,
          type: newQuantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          title: newQuantity === 0 ? 'Out of Stock' : 'Low Stock',
          message: `${item.name} is ${newQuantity === 0 ? 'out of stock' : 'running low'}. Current: ${newQuantity} ${item.unit}`,
          relatedItemId: itemId,
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
    await ActivityService.record({
      householdId,
      userId: req.userId!,
      type: 'ITEM_ADJUSTED',
      message: `${user?.name || 'Someone'} ${data.type === 'ADD' ? 'added' : data.type === 'REMOVE' ? 'used' : 'set'} ${data.quantity} ${item.unit} of ${item.name}`,
      metadata: { itemId, type: data.type, quantity: data.quantity, previousQuantity: item.quantity, newQuantity },
    });

    return res.json({ adjustment, item: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

inventoryRouter.post('/:householdId/items/:itemId/archive', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const itemId = getParam(req, 'itemId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const item = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { isArchived: true },
  });

  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
  await ActivityService.record({
    householdId,
    userId: req.userId!,
    type: 'ITEM_ARCHIVED',
    message: `${user?.name || 'Someone'} archived ${item.name}`,
    metadata: { itemId: item.id },
  });

  return res.json(item);
});