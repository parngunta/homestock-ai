import { Router } from 'express';
import { ActivityService } from '../services/activity-service';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { createShoppingItemSchema, updateShoppingItemSchema } from '../utils/validations';

export const shoppingListRouter = Router();

shoppingListRouter.get('/:householdId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const items = await prisma.shoppingListItem.findMany({
    where: { householdId },
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }],
  });

  return res.json(items);
});

shoppingListRouter.post('/:householdId', async (req: AuthRequest, res) => {
  try {
    const householdId = getParam(req, 'householdId');
    const data = createShoppingItemSchema.parse({ ...req.body, householdId });

    const member = await prisma.householdMember.findFirst({
      where: { userId: req.userId!, householdId },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this household' });
    }

    const item = await prisma.shoppingListItem.create({ data });

    const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
    await ActivityService.record({
      householdId,
      userId: req.userId!,
      type: 'SHOPPING_ITEM_CREATED',
      message: `${user?.name || 'Someone'} added ${item.name} to the shopping list`,
      metadata: { shoppingItemId: item.id, quantity: item.quantity, unit: item.unit },
    });

    return res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

shoppingListRouter.patch('/:householdId/items/:itemId', async (req: AuthRequest, res) => {
  try {
    const householdId = getParam(req, 'householdId');
    const itemId = getParam(req, 'itemId');
    const data = updateShoppingItemSchema.parse(req.body);

    const member = await prisma.householdMember.findFirst({
      where: { userId: req.userId!, householdId },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this household' });
    }

    const item = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data,
    });

    return res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

shoppingListRouter.delete('/:householdId/items/:itemId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const itemId = getParam(req, 'itemId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const shoppingItem = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, householdId },
  });

  if (!shoppingItem) {
    return res.status(404).json({ error: 'Shopping item not found' });
  }

  const userName = (await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } }))?.name || 'Someone';

  await prisma.shoppingListItem.delete({ where: { id: itemId } });

  await ActivityService.record({
    householdId,
    userId: req.userId!,
    type: 'SHOPPING_ITEM_DELETED',
    message: `${userName} removed ${shoppingItem.name} from the shopping list`,
    metadata: { shoppingItemId: itemId },
  });

  return res.json({ success: true });
});

shoppingListRouter.post('/:householdId/items/:itemId/purchase', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const itemId = getParam(req, 'itemId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const shoppingItem = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, householdId },
  });

  if (!shoppingItem) {
    return res.status(404).json({ error: 'Shopping item not found' });
  }

  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: { name: shoppingItem.name, householdId },
  });

  if (inventoryItem) {
    await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: { increment: shoppingItem.quantity } },
    });

    await prisma.inventoryAdjustment.create({
      data: {
        inventoryItemId: inventoryItem.id,
        userId: req.userId!,
        type: 'ADD',
        quantity: shoppingItem.quantity,
        previousQuantity: inventoryItem.quantity,
        newQuantity: inventoryItem.quantity + shoppingItem.quantity,
        note: 'Purchased from shopping list',
      },
    });
  }

  const updated = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { status: 'PURCHASED' },
  });

  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
  await ActivityService.record({
    householdId,
    userId: req.userId!,
    type: 'SHOPPING_ITEM_PURCHASED',
    message: `${user?.name || 'Someone'} purchased ${shoppingItem.name}`,
    metadata: { shoppingItemId: itemId, quantity: shoppingItem.quantity, unit: shoppingItem.unit },
  });

  return res.json(updated);
});