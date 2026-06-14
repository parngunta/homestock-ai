import { Router } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { ConsumptionEngine } from '../services/consumption-engine';

export const consumptionRouter = Router();

consumptionRouter.get('/:householdId/items/:itemId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const itemId = getParam(req, 'itemId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const records = await prisma.consumptionRecord.findMany({
    where: { inventoryItemId: itemId, householdId },
    orderBy: { recordedAt: 'desc' },
  });

  return res.json(records);
});

consumptionRouter.get('/:householdId/predictions', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const items = await prisma.inventoryItem.findMany({
    where: { householdId, isArchived: false, quantity: { gt: 0 } },
  });

  const predictions = await Promise.all(
    items.map(async (item) => {
      const prediction = await ConsumptionEngine.predictForItem(item.id, householdId);
      return { itemId: item.id, name: item.name, unit: item.unit, quantity: item.quantity, ...prediction };
    })
  );

  return res.json(predictions);
});