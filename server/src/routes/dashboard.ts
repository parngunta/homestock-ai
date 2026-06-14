import { ActivityService } from '../services/activity-service';
import { Router } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { ConsumptionEngine } from '../services/consumption-engine';

export const dashboardRouter = Router();

dashboardRouter.get('/:householdId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const [
    totalItems,
    categoryCounts,
    locationCounts,
    lowStockItems,
    predictedOutSoon,
    shoppingItems,
    unreadNotifications,
    recentActivity,
  ] = await Promise.all([
    prisma.inventoryItem.count({ where: { householdId, isArchived: false } }),
    prisma.inventoryItem.groupBy({ by: ['category'], where: { householdId, isArchived: false }, _count: true }),
    prisma.inventoryItem.groupBy({ by: ['location'], where: { householdId, isArchived: false }, _count: true }),
    ConsumptionEngine.getLowStockItems(householdId),
    ConsumptionEngine.getPredictedOutSoonItems(householdId),
    prisma.shoppingListItem.findMany({
      where: { householdId, status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 10,
    }),
    prisma.notification.count({ where: { userId: req.userId!, householdId, isRead: false } }),
    ActivityService.getRecent(householdId, 6),
  ]);

  const outOfStockItems = await prisma.inventoryItem.findMany({
    where: { householdId, isArchived: false, quantity: 0 },
  });

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const expiringSoon = await prisma.inventoryItem.findMany({
    where: {
      householdId,
      isArchived: false,
      expiryDate: { lte: threeDaysFromNow, gte: new Date() },
    },
    orderBy: { expiryDate: 'asc' },
    take: 5,
  });

  const insights: string[] = [];

  if (lowStockItems.length > 0) {
    insights.push(`${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low`);
  }

  if (outOfStockItems.length > 0) {
    insights.push(`${outOfStockItems.length} item${outOfStockItems.length > 1 ? 's' : ''} out of stock`);
  }

  if (expiringSoon.length > 0) {
    insights.push(`${expiringSoon.length} item${expiringSoon.length > 1 ? 's' : ''} expiring soon`);
  }

  if (predictedOutSoon.length > 0) {
    insights.push(`${predictedOutSoon.length} item${predictedOutSoon.length > 1 ? 's' : ''} may run out this week`);
  }

  if (shoppingItems.length > 0) {
    insights.push(`${shoppingItems.length} item${shoppingItems.length > 1 ? 's' : ''} on shopping list`);
  }

  return res.json({
    totalItems,
    categoryCounts,
    locationCounts,
    lowStockItems,
    outOfStockItems,
    expiringSoon,
    predictedOutSoon,
    shoppingItems,
    recentActivity,
    unreadNotifications,
    insights,
  });
});